using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Build.Locator;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.MSBuild;

namespace CsharpClassView.Models;

public interface ISolutionStructure
{
    public IDictionary<RoslynProject, IDictionary<RoslynNamespace, ISet<IRoslynUnit>>> Projects { get; }
    public IList<string> GetProjectNames();

}

/// <summary>
/// Stores the structure of a Roslyn solution.
/// The root of the tree is the solution.
/// First level children are projects.
/// Second level children are namespaces.
/// Third level children are classes and enums.
/// Fourth level children are class members - fields, methods, constructors, properties, inner classes and inner enums, etc.
/// </summary>
/// <param name="solutionFilePath">Path to solution file in filesystem.</param>
public class RoslynSolution(string solutionFilePath) : ISolutionStructure
{
    private readonly string _solutionFilePath = solutionFilePath;

    public string Name => Path.GetFileName(_solutionFilePath);
    private readonly IDictionary<RoslynProject, IDictionary<RoslynNamespace, ISet<IRoslynUnit>>> projects
        = new Dictionary<RoslynProject, IDictionary<RoslynNamespace, ISet<IRoslynUnit>>>();
    public IDictionary<RoslynProject, IDictionary<RoslynNamespace, ISet<IRoslynUnit>>> Projects => projects;
    public IList<string> GetProjectNames() => [.. projects.Keys.Select(project => project.Name).ToList()];

    public async Task AnalyzeSolutionAsync()
    {
        MSBuildLocator.RegisterDefaults();
        
        using var workspace = MSBuildWorkspace.Create();
        Solution solution = await workspace.OpenSolutionAsync(_solutionFilePath);
        
        if (!solution.Projects.Any()) return;

        foreach (Project project in solution.Projects)
        {
            Compilation? compilation = await project.GetCompilationAsync();
            if (compilation == null)
            {
                Console.Error.WriteLine($"Compilation of project: '{project.Name}' failed.");
                continue;
            }

            RoslynProject roslynProject = new(project.Name);
            IDictionary<RoslynNamespace, ISet<IRoslynUnit>> namespacesByFile = new Dictionary<RoslynNamespace, ISet<IRoslynUnit>>();
            foreach (Document document in project.Documents)
            {
                SyntaxTree? syntaxTree = await document.GetSyntaxTreeAsync();
                if (syntaxTree == null) continue;

                SyntaxNode root = await syntaxTree.GetRootAsync();
                SemanticModel semanticModel = compilation.GetSemanticModel(syntaxTree);

                ExtractNamespaceAndClassesFromSourceFile(root, semanticModel, namespacesByFile);
            }

            projects[roslynProject] = namespacesByFile;
        }
    }

    private static void ExtractNamespaceAndClassesFromSourceFile(SyntaxNode node, SemanticModel model, IDictionary<RoslynNamespace, ISet<IRoslynUnit>> namespacesByFile)
    {
        foreach (NamespaceDeclarationSyntax namespaceNode in node.DescendantNodes().OfType<NamespaceDeclarationSyntax>())
        {
            INamespaceSymbol? namespaceSymbol = model.GetDeclaredSymbol(namespaceNode);
            if (namespaceSymbol is null) continue;
            RoslynNamespace roslynNamespace = new(namespaceSymbol.ToDisplayString());
            if (!namespacesByFile.ContainsKey(roslynNamespace)) namespacesByFile[roslynNamespace] = new HashSet<IRoslynUnit>();

            foreach (var classNode in namespaceNode.DescendantNodes().OfType<ClassDeclarationSyntax>())
            {
                if (model.GetDeclaredSymbol(classNode) is not INamedTypeSymbol classSymbol) continue;
                RoslynClass roslynClass = new(classSymbol.Name);

                foreach (MemberDeclarationSyntax member in classNode.Members)
                {
                    switch (member.Kind())
                    {
                        case SyntaxKind.MethodDeclaration:
                            if (model.GetDeclaredSymbol(member) is not IMethodSymbol methodSymbol) continue;
                            roslynClass.Methods.Add(methodSymbol.Name);
                            break;
                        case SyntaxKind.PropertyDeclaration:
                            if (model.GetDeclaredSymbol(member) is not IPropertySymbol propertySymbol) continue;
                            roslynClass.Properties.Add(propertySymbol.Name);
                            break;
                        case SyntaxKind.FieldDeclaration:
                            if (model.GetDeclaredSymbol(member) is not IFieldSymbol fieldSymbol) continue;
                            roslynClass.Fields.Add(fieldSymbol.Name);
                            break;
                        case SyntaxKind.ConstructorDeclaration:
                            if (model.GetDeclaredSymbol(member) is not IMethodSymbol constructorSymbol) continue;
                            roslynClass.Constructors.Add(constructorSymbol.Name);
                            break;
                    }
                }

                namespacesByFile[roslynNamespace].Add(roslynClass);
            }

            foreach (var enumNode in namespaceNode.DescendantNodes().OfType<EnumDeclarationSyntax>())
            {
                if (model.GetDeclaredSymbol(enumNode) is not INamedTypeSymbol enumSymbol) continue;
                RoslynEnum roslynEnum = new(enumSymbol.Name)
                {
                    Options = enumSymbol.GetMembers()
                                                    .Where(static member => member.Kind is SymbolKind.Field)
                                                    .Select(static symbol => symbol.ToDisplayString(SymbolDisplayFormat.FullyQualifiedFormat))
                                                    .ToList()
                };

                namespacesByFile[roslynNamespace].Add(roslynEnum);
            }
        }
    }
}

public class RoslynProject(string name)
{
    private readonly string name = name;
    public string Name => name;
}

public class RoslynNamespace(string name)
{
    private readonly string name = name;
    public string Name => name;
}

public interface IRoslynUnit
{
    string Name { get; }

    
}

public class RoslynInterface(string name) : IRoslynUnit
{
    public string Name => name;
    public IList<string> Methods { get; set; } = [];
}

public class RoslynClass(string name) : IRoslynUnit
{
    public string Name => name;

    public IList<string> Constructors { get; set; } = [];
    public IList<string> Methods { get; set; } = [];
    public IList<string> Properties { get; set; } = [];
    public IList<string> Fields { get; set; } = [];

    public IList<RoslynClass>? BaseTypes { get; set; } = [];
    public IList<RoslynInterface>? BaseInterfaces { get; set; } = [];

}

public class RoslynEnum(string name) : IRoslynUnit
{
    public string Name { get; } = name;

    public IList<string> Options { get; set; } = [];
}