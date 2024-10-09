using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using CsharpClassView;

using Grpc.Core;

namespace CsharpClassView.Services;

public class GreeterService(ILogger<GreeterService> logger) : Greeter.GreeterBase
{
    private readonly ILogger<GreeterService> _logger = logger;

    public override Task<HelloReply> SayHello(HelloRequest request, ServerCallContext context) 
    => Task.FromResult(new HelloReply
        {
            Message = "Hello " + request.Name
        });
}
