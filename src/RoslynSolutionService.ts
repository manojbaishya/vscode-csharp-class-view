import { createClient } from "@connectrpc/connect";
import { createGrpcTransport } from "@connectrpc/connect-node";
import { RoslynSolutionMessage, RoslynSyntaxTree } from "./gen/syntaxtree_pb";
import appconfig from "../appconfig.json";

const transport = createGrpcTransport({
    baseUrl: appconfig.SOLUTION_PARSER_GRPC_SERVICE!,
    interceptors: []
});

export async function getSolutionStructure(solutionPath: string): Promise<RoslynSolutionMessage> {
    const roslynSyntaxTree = createClient(RoslynSyntaxTree, transport);
    try {
        const solutionStructure = await roslynSyntaxTree.parse({ path: solutionPath });
        return Promise.resolve(solutionStructure);
    } catch (error) {
        console.error("Error parsing solution structure: ", error);
        return Promise.reject(error);
    }
}