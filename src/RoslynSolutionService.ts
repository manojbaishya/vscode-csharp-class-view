import { createClient, Transport } from "@connectrpc/connect";
import { createGrpcTransport } from "@connectrpc/connect-node";
import { RoslynSolutionMessage, RoslynSyntaxTree } from "./gen/syntaxtree_pb.js";
import appconfig from "../appconfig.json" assert { type: "json" };

const transport = createGrpcTransport({
    baseUrl: appconfig.SOLUTION_PARSER_GRPC_SERVICE!,
    interceptors: []
});

export async function getSolutionStructure(solutionPath: string): Promise<RoslynSolutionMessage> {
    const roslynSyntaxTree = createClient(RoslynSyntaxTree, transport);
    try {
        const solutionStructure: RoslynSolutionMessage = await roslynSyntaxTree.parse({ path: solutionPath });
        return Promise.resolve(solutionStructure);
    } catch (error) {
        console.error("Error parsing solution structure: ", error);
        return Promise.reject(error);
    }
}

export class RoslynSolutionService {
    constructor(private readonly solutionPath: string)  { }

    private readonly transport: Transport = createGrpcTransport({
        baseUrl: appconfig.SOLUTION_PARSER_GRPC_SERVICE!,
        interceptors: []
    });

    private readonly roslynSyntaxTree = createClient(RoslynSyntaxTree, this.transport);
    
    public async getSolutionStructure(): Promise<RoslynSolutionMessage> {
        try {
            const solutionStructure: RoslynSolutionMessage = await this.roslynSyntaxTree.parse({ path: this.solutionPath });
            return Promise.resolve(solutionStructure);
        } catch (error) {
            console.error("Error parsing solution structure: ", error);
            return Promise.reject(error);
        }
    }

    public async getSolution(): Promise<RoslynSolution> {
        const solutionStructure = await this.getSolutionStructure();
        const mapper = new RoslynSolutionMapper(solutionStructure);
        return mapper.MapResponse();
    }
}

class RoslynSolutionMapper {
    constructor(private readonly solutionStructure: RoslynSolutionMessage) { }

    public MapResponse(): RoslynSolution {
        const roslynSolution = new RoslynSolution(this.solutionStructure.name);

        for (const projectMessage of this.solutionStructure.roslynProjects) {
            const namespaces = new Map<string, Map<string, IRoslynUnit>>();
            for (const namespaceMessage of projectMessage.roslynNamespaces) {
                const namespace: Map<string, IRoslynUnit> = new Map<string, IRoslynUnit>();
                for (const classMessage of namespaceMessage.roslynClasses) {
                    const roslynClass = new RoslynClass(classMessage.name);

                    roslynClass.Constructors = classMessage.constructors;
                    roslynClass.Methods = classMessage.methods;
                    roslynClass.Properties = classMessage.properties;
                    roslynClass.Fields = classMessage.fields;
                    roslynClass.BaseTypes = classMessage.baseClasses;
                    roslynClass.BaseInterfaces = classMessage.baseInterfaces;

                    namespace.set(roslynClass.Name, roslynClass);
                }

                for (const interfaceMessage of namespaceMessage.roslynInterfaces) {
                    const roslynInterface = new RoslynInterface(interfaceMessage.name);
                    roslynInterface.Methods = interfaceMessage.methods;

                    namespace.set(roslynInterface.Name, roslynInterface);
                }

                for (const enumMessage of namespaceMessage.roslynEnums) {
                    const roslynEnum = new RoslynEnum(enumMessage.name);
                    roslynEnum.Options = enumMessage.options;

                    namespace.set(roslynEnum.Name, roslynEnum);
                }
                namespaces.set(namespaceMessage.name, namespace);
            }

            roslynSolution.Projects.set(projectMessage.name, namespaces);
        }

        return roslynSolution;
    }
}

export class RoslynSolution {
    constructor(public readonly Name: string) {}

    public Projects: Map<string, Map<string, Map<string, IRoslynUnit>>> = new Map<string, Map<string, Map<string, IRoslynUnit>>>();
}

export type RoslynType = "Solution" | "Project" | "Namespace" | "Interface" | "Enum" | "Option" | "Class" | "Constructor" | "Method" | "Property" | "Field" ;

interface IRoslynUnit {
    Name: string;
    GetType(): string;
}

export class RoslynInterface implements IRoslynUnit {
    constructor(public readonly Name: string) {}
    public GetType(): string {
        return "Interface";
    }

    public Methods: string[] = [];

}

export class RoslynClass implements IRoslynUnit {
    constructor(public readonly Name: string) {}
    public GetType(): string {
        return "Class";
    }


    public Constructors: string[] = [];
    public Methods: string[] = [];
    public Properties: string[] = [];
    public Fields: string[] = [];
    public BaseTypes: string[] = [];
    public BaseInterfaces: string[] = [];
}

export class RoslynEnum implements IRoslynUnit {
    constructor(public readonly Name: string) {}

    public GetType(): string {
        return "Enum";
    }
    public Options: string[] = [];
}