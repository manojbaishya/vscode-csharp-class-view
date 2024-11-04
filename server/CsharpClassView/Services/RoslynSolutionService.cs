using Microsoft.Extensions.Logging;

using CsharpClassView.Protos;
using Grpc.Core;

using System.Threading.Tasks;
using CsharpClassView.Models;
using CsharpClassView.Mappers;

namespace CsharpClassView.Services;

public class RoslynSolutionService(ILogger<RoslynSolutionService> logger) : RoslynSyntaxTree.RoslynSyntaxTreeBase
{
    private readonly ILogger<RoslynSolutionService> _logger = logger;

    public override async Task<RoslynSolutionMessage> Parse(SolutionLocation solutionLocation, ServerCallContext context)
    {
        string solutionPath = solutionLocation.Path;
        RoslynSolution roslynSolution= new(solutionPath);

        await roslynSolution.AnalyzeSolutionAsync();

        var mapper = new RoslynSolutionMapper(roslynSolution);
        RoslynSolutionMessage response = mapper.Map();

        return response;
    }
}
