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
        _logger.LogInformation("Parsing solution at {Path}", solutionLocation.Path);
        string solutionPath = solutionLocation.Path;
        RoslynSolution roslynSolution= new(solutionPath);

        await roslynSolution.AnalyzeSolutionAsync();

        _logger.LogInformation("Completed parsing solution at {Path}", solutionLocation.Path);

        RoslynSolutionMapper mapper = new(roslynSolution);
        RoslynSolutionMessage response = mapper.Map();
        
        _logger.LogInformation("Mapped response.");
        return response;
    }
}
