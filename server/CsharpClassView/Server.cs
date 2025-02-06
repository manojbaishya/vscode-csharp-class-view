using CsharpClassView.Services;

using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace CsharpClassView;

public class Server
{
    public static void Main(string[] args)
    {
        WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
        builder.Configuration.AddEnvironmentVariables();
        builder.Services.AddGrpc();
        SetGrpcIpAndPort(builder);
        builder.Services.AddGrpcHealthChecks().AddCheck("GRPCHealthCheck", () => HealthCheckResult.Healthy());;

        WebApplication app = builder.Build();
        app.MapGrpcService<RoslynSolutionService>();
        app.MapGrpcHealthChecksService(); 
        app.MapGet("/", () => "SIMPLEHEALTHCHECK=OK");

        app.Run();
    }

    private static void SetGrpcIpAndPort(WebApplicationBuilder builder)
    {
        builder.WebHost.UseKestrel(options =>
        {
            string? grpcPortStr = Environment.GetEnvironmentVariable("GRPC_PORT");
            if (string.IsNullOrEmpty(grpcPortStr))
                throw new InvalidOperationException("Environment variable 'GRPC_PORT' is not set.");

            if (int.TryParse(grpcPortStr, out int grpcPort))
            {
                options.ListenLocalhost(grpcPort, listenOptions =>
                {
                    listenOptions.Protocols = HttpProtocols.Http2;
                });
            }
            else
            {
                throw new InvalidOperationException("Environment variable 'GRPC_PORT' is not a valid port number.");
            }
        });
    }
}