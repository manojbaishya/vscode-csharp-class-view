using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

using CsharpClassView.Models;

using Xunit;
using Xunit.Abstractions;

namespace CsharpClassView.UnitTests;

public class RoslynSolutionTests(ITestOutputHelper output)
{
    private readonly ITestOutputHelper output = output;

    [Fact]
    public async Task TestAnalyzeSolutionAsync()
    {
        string solutionPath = @$"{Directory.GetParent(AppDomain.CurrentDomain.BaseDirectory)?.Parent?.Parent?.Parent?.FullName}/TestSolution/TestSolution.sln";
        output.WriteLine($"TestSolution path is '{solutionPath}'");
        
        RoslynSolution roslynSolution= new(solutionPath);

        await roslynSolution.AnalyzeSolutionAsync();

        var projects = roslynSolution.Projects;

        Assert.Contains(projects, project => project.Key.Name == "TestProject1");
        KeyValuePair<RoslynProject, IDictionary<RoslynNamespace, ISet<IRoslynUnit>>> project = projects.FirstOrDefault(project => project.Key.Name == "TestProject1");
        IDictionary<RoslynNamespace, ISet<IRoslynUnit>> namespaces = project.Value;
        Assert.Contains(namespaces, namespaces => namespaces.Key.Name == "TestProject1");
        KeyValuePair<RoslynNamespace, ISet<IRoslynUnit>> namespace_project = namespaces.FirstOrDefault(namespaces => namespaces.Key.Name == "TestProject1");
        ISet<IRoslynUnit> units = namespace_project.Value;
        Assert.Contains(units, unit => unit.Name == "TestProgram1Main");
        IRoslynUnit? unit = units.FirstOrDefault(unit => unit.Name.Equals("TestProgram1Main"));
        Assert.NotNull(unit);
        Assert.True(unit is RoslynClass);
        RoslynClass? unitClass = unit as RoslynClass;
        Assert.NotNull(unitClass);
        Assert.Contains(unitClass.Methods, methodName => methodName == "Main");

        Assert.Contains(namespaces, namespaces => namespaces.Key.Name == "TestProject1.Models");
        namespace_project = namespaces.FirstOrDefault(namespaces => namespaces.Key.Name == "TestProject1.Models");
        units = namespace_project.Value;
        Assert.Contains(units, unit => unit.Name == "Employee");
        unit = units.FirstOrDefault(unit => unit.Name.Equals("Employee"));
        Assert.NotNull(unit);
        Assert.True(unit is RoslynClass);
        unitClass = unit as RoslynClass;
        Assert.NotNull(unitClass);
        Assert.Contains(unitClass.Properties, propertyName => propertyName == "Id");
        Assert.Contains(unitClass.Properties, propertyName => propertyName == "Name");

        Assert.Contains(units, unit => unit.Name == "Account");
        unit = units.FirstOrDefault(unit => unit.Name.Equals("Account"));
        Assert.NotNull(unit);
        Assert.True(unit is RoslynClass);
        unitClass = unit as RoslynClass;
        Assert.NotNull(unitClass);
        Assert.Contains(unitClass.Properties, propertyName => propertyName == "Id");
        Assert.Contains(unitClass.Properties, propertyName => propertyName == "Employee");

        Assert.Contains(units, unit => unit.Name == "AccountType");
        unit = units.FirstOrDefault(unit => unit.Name.Equals("AccountType"));
        Assert.NotNull(unit);
        Assert.True(unit is RoslynEnum);
        RoslynEnum? unitEnum = unit as RoslynEnum;
        Assert.NotNull(unitEnum);
        Assert.Contains(unitEnum.Options, optionName => optionName == "Checking");
        Assert.Contains(unitEnum.Options, optionName => optionName == "Savings");

        
        Assert.Contains(projects, project => project.Key.Name == "TestProject2");
        project = projects.FirstOrDefault(project => project.Key.Name == "TestProject2");
        namespaces = project.Value;
        Assert.Contains(namespaces, namespaces => namespaces.Key.Name == "TestProject2");
        namespace_project = namespaces.FirstOrDefault(namespaces => namespaces.Key.Name == "TestProject2");
        units = namespace_project.Value;
        Assert.Contains(units, unit => unit.Name == "TestProgram2Main");
        unit = units.FirstOrDefault(unit => unit.Name.Equals("TestProgram2Main"));
        Assert.NotNull(unit);
        Assert.True(unit is RoslynClass);
        unitClass = unit as RoslynClass;
        Assert.NotNull(unitClass);
        Assert.Contains(unitClass.Methods, methodName => methodName == "Main");

        Assert.Contains(namespaces, namespaces => namespaces.Key.Name == "TestProject2.Models");
        namespace_project = namespaces.FirstOrDefault(namespaces => namespaces.Key.Name == "TestProject2.Models");
        units = namespace_project.Value;
        Assert.Contains(units, unit => unit.Name == "Factory");
        unit = units.FirstOrDefault(unit => unit.Name.Equals("Factory"));
        Assert.NotNull(unit);
        Assert.True(unit is RoslynClass);
        unitClass = unit as RoslynClass;
        Assert.NotNull(unitClass);
        Assert.Contains(unitClass.Properties, propertyName => propertyName == "Id");
        Assert.Contains(unitClass.Properties, propertyName => propertyName == "Name");

        Assert.Contains(units, unit => unit.Name == "Material");
        unit = units.FirstOrDefault(unit => unit.Name.Equals("Material"));
        Assert.NotNull(unit);
        Assert.True(unit is RoslynClass);
        unitClass = unit as RoslynClass;
        Assert.NotNull(unitClass);
        Assert.Contains(unitClass.Properties, propertyName => propertyName == "Id");
        Assert.Contains(unitClass.Properties, propertyName => propertyName == "Factory");

        Assert.Contains(units, unit => unit.Name == "MaterialType");
        unit = units.FirstOrDefault(unit => unit.Name.Equals("MaterialType"));
        Assert.NotNull(unit);
        Assert.True(unit is RoslynEnum);
        unitEnum = unit as RoslynEnum;
        Assert.NotNull(unitEnum);
        Assert.Contains(unitEnum.Options, optionName => optionName == "Untraceable");
        Assert.Contains(unitEnum.Options, optionName => optionName == "Batch");
        Assert.Contains(unitEnum.Options, optionName => optionName == "Serial");
    }
}