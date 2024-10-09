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
        
        app.MapGrpcService<GreeterService>();
        app.MapGet("/", 
            () => "Communication with gRPC endpoints must be made through a gRPC client. To learn how to create a client, visit: https://go.microsoft.com/fwlink/?linkid=2086909"
        );

        app.Run();

    }
}

