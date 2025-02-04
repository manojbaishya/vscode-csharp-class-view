import * as vscode from 'vscode';
import { CsharpClassView as CsharpClassViewDataProvider } from './CsharpClassView';
import { createLogger, Logger } from './logger';

export async function activate(context: vscode.ExtensionContext) {
	const output = vscode.window.createOutputChannel("C# Class View");
	const logger: Logger = createLogger(output);
	logger.log('Activating C# Class View...');

	const isWorkspaceOpen = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0;
	const workspaceRoot = isWorkspaceOpen ? vscode.workspace.workspaceFolders![0].uri.fsPath : undefined;

	if (workspaceRoot) {

		const csharpClassView = new CsharpClassViewDataProvider(workspaceRoot);
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

export function deactivate() { }
