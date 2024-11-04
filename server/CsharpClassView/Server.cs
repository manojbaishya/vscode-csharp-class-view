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

        IWebHostEnvironment env = app.Environment;

        if (env.IsDevelopment())
        {
            app.MapGrpcReflectionService().AllowAnonymous();
        }

        app.MapGet("/", 
            () => "Communication with gRPC endpoints must be made through a gRPC client. To learn how to create a client, visit: https://go.microsoft.com/fwlink/?linkid=2086909"
        );

        app.Run();

    }
}

