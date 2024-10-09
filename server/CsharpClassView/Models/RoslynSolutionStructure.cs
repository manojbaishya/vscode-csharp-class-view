using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;

namespace CsharpClassView.Models;

public interface ISolutionStructure
{
    public IList<string> GetProjects();
}

public class RoslynSolutionStructure(string solutionFilePath) : ISolutionStructure
{
    private readonly string solutionFilePath = solutionFilePath;
    public string SolutionFilePath => solutionFilePath;

    private readonly IDictionary<string, IList<RoslynNamespaces>> projects 
        = new SortedDictionary<string, IList<RoslynNamespaces>>();

    public IList<string> GetProjects() => [.. projects.Keys];
}

public class RoslynNamespaces : IDictionary<string, IList<IRoslynUnit>>
{

    private readonly IDictionary<string, IList<IRoslynUnit>> namespaces;

    public RoslynNamespaces()
    {
        namespaces = new SortedDictionary<string, IList<IRoslynUnit>>();
    }

    public IList<IRoslynUnit> this[string key] { 
        get => namespaces[key]; 
        set => namespaces[key] = value; 
    }

    public ICollection<string> Keys => namespaces.Keys;

    public ICollection<IList<IRoslynUnit>> Values => namespaces.Values;

    public int Count => namespaces.Count;

    public bool IsReadOnly => namespaces.IsReadOnly;

    public void Add(string key, IList<IRoslynUnit> value) => namespaces.Add(key, value);

    public void Add(KeyValuePair<string, IList<IRoslynUnit>> item) => namespaces.Add(item);

    public void Clear() => namespaces.Clear();

    public bool Contains(KeyValuePair<string, IList<IRoslynUnit>> item) => namespaces.Contains(item);

    public bool ContainsKey(string key) => namespaces.ContainsKey(key);

    public void CopyTo(KeyValuePair<string, IList<IRoslynUnit>>[] array, int arrayIndex) => namespaces.CopyTo(array, arrayIndex);

    public IEnumerator<KeyValuePair<string, IList<IRoslynUnit>>> GetEnumerator() => namespaces.GetEnumerator();

    public bool Remove(string key) => namespaces.Remove(key);

    public bool Remove(KeyValuePair<string, IList<IRoslynUnit>> item) => namespaces.Remove(item);

    public bool TryGetValue(string key, [MaybeNullWhen(false)] out IList<IRoslynUnit> value) => namespaces.TryGetValue(key, out value);

    IEnumerator IEnumerable.GetEnumerator() => namespaces.GetEnumerator();
}

public interface IRoslynUnit
{
    string Name { get; }
}

public class RoslynClass(string name) : IRoslynUnit
{
    private readonly string name = name;
    public string Name => name;

    public IList<string>? Methods { get; set; }
    public IList<string>? Properties { get; set; }
    public IList<string>? Fields { get; set; }
    public IList<string>? Constructors { get; set; }

    public IList<RoslynClass>? BaseTypes { get; set; }

}

public class RoslynEnum(string name) : IRoslynUnit
{
    private readonly string name = name;
    public string Name => name;

    public IList<string>? Options { get; set; }
}