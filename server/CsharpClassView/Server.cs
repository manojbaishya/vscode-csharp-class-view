using CsharpClassView.Services;

using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;

namespace CsharpClassView;

public class Server
{
    public static void Main(string[] args)
    {
        WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
        builder.Services.AddGrpc();

        WebApplication app = builder.Build();
        app.MapGrpcService<RoslynSolutionService>();
        app.MapGet("/", () => "CsharpClassView Server is running.");
        app.Run();
    }
}