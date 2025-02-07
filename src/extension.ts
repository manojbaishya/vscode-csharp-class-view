import * as vscode from 'vscode';
import * as net from 'net';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import { CsharpClassView as CsharpClassViewDataProvider } from './CsharpClassView';
import { createLogger, Logger } from './logger';
import { connect } from 'http2';

let csharpClassViewServer: childProcess.ChildProcess | null = null;
let serverOutput = vscode.window.createOutputChannel('C# Class View Server');
let output: vscode.OutputChannel;
let logger: Logger;

export async function activate(context: vscode.ExtensionContext) {
	output = vscode.window.createOutputChannel("C# Class View");
	logger = createLogger(output);
	logger.log('Activating C# Class View...');

	// Start server -------------------------------------------------------------------------------------
	const isDotnetInstalled = await isDotnetInPath();
	if (!isDotnetInstalled) {
		logger.log('"dotnet" is not on PATH. Cannot start extension. Check your .NET installation and append "dotnet" to PATH!');
		return;
	}
	const serverPort: number = await getRandomAvailablePortInLocalhost();
	process.env.GRPC_PORT = serverPort.toString();
	
	const serverPath = context.asAbsolutePath('./compiler/CsharpClassView.dll');
	serverOutput.appendLine(`Starting GRPC server on port: '${serverPort}' from path: '${serverPath}'`);
	csharpClassViewServer = childProcess.spawn('dotnet', [serverPath], 
		{ 	
			detached: false, 
			env: { ...process.env, GRPC_PORT: serverPort.toString() }
		}
	);
	if (!csharpClassViewServer) {
		logger.log('Failed to start server process. Cannot start extension!');
		return;
	}

	csharpClassViewServer.stdout!.on('data', (data) => {
		const output = data.toString();
		serverOutput.append(output);
	  });
  
	csharpClassViewServer.stderr!.on('data', (data) => {
		const errorOutput = data.toString();
		serverOutput.appendLine(`[Error] ${errorOutput}`);
	});

	csharpClassViewServer.on('error', (error) => {
		logger.log(`GRPC server PID: '${csharpClassViewServer?.pid}' error: '${error}'`);
	});

	csharpClassViewServer.on('exit', (code) => {
		logger.log(`GRPC server PID: '${csharpClassViewServer?.pid}' exited with code ${code}`);
		csharpClassViewServer = null;
	});

	// TODO: Implement GRPC server health check
	// setTimeout(() => {
	// 	logger.log(`[Health check] GRPC server PID: '\${csharpClassViewServer.pid}' serving on port '${port}'`);
	//   }, 1000);

	try {
        await checkServerHealth(`http://localhost:${serverPort}`, 15000);
    } catch (error) {
        logger.log(`Health check failed: ${error}`);
		return;
    }

	logger.log(`GRPC server PID: '${csharpClassViewServer.pid}' started on port '${serverPort}'`);

	// Activate extension -------------------------------------------------------------------------------------
	const isWorkspaceOpen = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0;
	const workspaceRoot = isWorkspaceOpen ? vscode.workspace.workspaceFolders![0].uri.fsPath : undefined;
	if (workspaceRoot) {
		const csharpClassView = new CsharpClassViewDataProvider(workspaceRoot, logger);
		await csharpClassView.initializeCache();
		const csharpClassViewDataProvider = vscode.window.registerTreeDataProvider('csharpClassView', csharpClassView);
		context.subscriptions.push(csharpClassViewDataProvider);

		const collapseCsharpClassExplorer = vscode.commands.registerCommand(
			'csharpClassView.collapseCsharpClassExplorer',
			() => vscode.commands.executeCommand('workbench.actions.treeView.csharpClassView.collapseAll'));
		context.subscriptions.push(collapseCsharpClassExplorer);

		const refreshCsharpClassExplorer = vscode.commands.registerCommand(
			'csharpClassView.refreshCsharpClassExplorer',
			async () => await csharpClassView.refresh());
		context.subscriptions.push(refreshCsharpClassExplorer);

		logger.log('Activated C# Class View!');
	} else {
		logger.log('No workspace is open!');
	}
}

async function getRandomAvailablePortInLocalhost(): Promise<number> {
	return new Promise((resolve, reject) => {
		const server = net.createServer();

		server.listen({ port: 0, host: '127.0.0.1' }, () => {
			const port = (server.address() as net.AddressInfo).port;
			server.close(() => { resolve(port); });
		});

		server.on('error', (err) => { reject(err); });
	});
}

async function isDotnetInPath() {
	const pathEnv = process.env.PATH!;
	const paths = pathEnv.split(process.platform === 'win32' ? ';' : ':');
	for (const path of paths) {
		try {
			if (process.platform === 'win32') {
				await fs.promises.access(`${path}/dotnet.exe`, fs.promises.constants.F_OK);
			} else {
				await fs.promises.access(`${path}/dotnet`, fs.promises.constants.F_OK);
			}
			return true;
		} catch (error) {
			continue;
		}
	}
	return false;
}

async function checkServerHealth(url: string, timeoutMs: number = 10000): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
        try {
            const text = await sendHttp2Request(url);
			logger.log(`[Health Check] Server health check response: ${text}`);
            if (text === "SIMPLEHEALTHCHECK=OK") {
                logger.log("Server is ready!");
                return;
            }
        } catch (error) {
        }
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    throw new Error(`Server did not become ready within ${timeoutMs}ms`);
}

async function sendHttp2Request(url: string) {
    const client = connect(url);

    return new Promise<string>((resolve, reject) => {
        const req = client.request({
            ":method": "GET"
        });

        let responseData = "";

        req.on("data", chunk => {
            responseData += chunk;
        });

        req.on("end", () => {
            if (responseData.trim() === "SIMPLEHEALTHCHECK=OK") {
                resolve(responseData.trim());
            } else {
                reject("Unexpected response");
            }
            client.close();
        });

        req.on("error", reject);

        req.end();
    });
}

export function deactivate() {
    if (csharpClassViewServer) {
        logger.log(`Terminating GRPC server with PID: ${csharpClassViewServer.pid}`);

        try {
            csharpClassViewServer.kill('SIGTERM');
            logger.log(`Terminated GRPC server with PID: ${csharpClassViewServer.pid}`);
        } catch (error) {
            logger.log(`Failed to terminate GRPC server with PID: ${csharpClassViewServer.pid}. Error: ${error}`);
        }
        csharpClassViewServer = null;
    }
 }
