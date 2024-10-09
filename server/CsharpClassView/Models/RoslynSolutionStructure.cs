using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;

namespace CsharpClassView.Models;

public interface ISolutionStructure
{
    // Get Projects
    // Get Namespaces
}

public class RoslynSolutionStructure(string solutionFilePath) : ISolutionStructure
{
    private readonly string solutionFilePath = solutionFilePath;
    public string SolutionFilePath => solutionFilePath;

    private IDictionary<string, IList<RoslynNamespaces>> projects;

}

public class RoslynNamespaces : IDictionary<string, IList<IRoslynUnit>>
{
    public IList<IRoslynUnit> this[string key] { get => throw new NotImplementedException(); set => throw new NotImplementedException(); }

    public ICollection<string> Keys => throw new NotImplementedException();

    public ICollection<IList<IRoslynUnit>> Values => throw new NotImplementedException();

    public int Count => throw new NotImplementedException();

    public bool IsReadOnly => throw new NotImplementedException();

    public void Add(string key, IList<IRoslynUnit> value)
    {
        throw new NotImplementedException();
    }

    public void Add(KeyValuePair<string, IList<IRoslynUnit>> item)
    {
        throw new NotImplementedException();
    }

    public void Clear()
    {
        throw new NotImplementedException();
    }

    public bool Contains(KeyValuePair<string, IList<IRoslynUnit>> item)
    {
        throw new NotImplementedException();
    }

    public bool ContainsKey(string key)
    {
        throw new NotImplementedException();
    }

    public void CopyTo(KeyValuePair<string, IList<IRoslynUnit>>[] array, int arrayIndex)
    {
        throw new NotImplementedException();
    }

    public IEnumerator<KeyValuePair<string, IList<IRoslynUnit>>> GetEnumerator()
    {
        throw new NotImplementedException();
    }

    public bool Remove(string key)
    {
        throw new NotImplementedException();
    }

    public bool Remove(KeyValuePair<string, IList<IRoslynUnit>> item)
    {
        throw new NotImplementedException();
    }

    public bool TryGetValue(string key, [MaybeNullWhen(false)] out IList<IRoslynUnit> value)
    {
        throw new NotImplementedException();
    }

    IEnumerator IEnumerable.GetEnumerator()
    {
        throw new NotImplementedException();
    }
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