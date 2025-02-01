using CsharpClassView.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace CsharpClassView;

public class Server
{
    public static void Main(string[] args)
    {
        WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
        builder.Services.AddGrpc();
        builder.Services.AddGrpcReflection();

        WebApplication app = builder.Build();
        app.MapGrpcService<RoslynSolutionService>();
        if (app.Environment.IsDevelopment())
            app.MapGrpcReflectionService().AllowAnonymous();

        app.MapGet("/", () => "CsharpClassView Server is running.");
        app.Run();

    }
}

