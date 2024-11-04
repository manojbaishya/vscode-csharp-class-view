using System;
using System.Collections.Generic;
using CsharpClassView.Models;
using CsharpClassView.Protos;
using Microsoft.AspNetCore.Mvc;

namespace CsharpClassView.Mappers;

public class RoslynSolutionMapper(RoslynSolution roslynSolution)
{
    private readonly RoslynSolution roslynSolution = roslynSolution;

    public RoslynSolutionMessage Map() {
        RoslynSolutionMessage roslynSolutionMessage = new()
        {
            Name = roslynSolution.Name
        };

        foreach (var project in roslynSolution.Projects ) 
        {
            var projectMessage = new RoslynProjectMessage
            {
                Name = project.Key.Name
            };

            foreach (var ns in project.Value) {

                var namespaceMessage = new RoslynNamespaceMessage
                {
                    Name = ns.Key.Name
                };

                foreach (IRoslynUnit unit in ns.Value) 
                {
                    switch (unit)
                    {
                        case RoslynClass roslynclass:
                            var classMsg = new RoslynClassMessage
                            {
                                Name = roslynclass.Name
                            };

                            classMsg.Constructors.AddRange(roslynclass.Constructors);
                            classMsg.Methods.AddRange(roslynclass.Methods);
                            classMsg.Properties.AddRange(roslynclass.Properties);
                            classMsg.Fields.AddRange(roslynclass.Fields);

                            namespaceMessage.RoslynClasses.Add(classMsg);
                            break;
                        case RoslynEnum roslynEnum:
                            var enumMessage = new RoslynEnumMessage
                            {
                                Name = roslynEnum.Name
                            };

                            enumMessage.Options.AddRange(roslynEnum.Options);

                            namespaceMessage.RoslynEnums.Add(enumMessage);
                            break;
                        default:
                            break;
                    }
                }

                projectMessage.RoslynNamespaces.Add(namespaceMessage);
            }

            roslynSolutionMessage.RoslynProjects.Add(projectMessage);
        }

        return roslynSolutionMessage;
    }
}