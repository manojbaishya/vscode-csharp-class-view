import * as vscode from 'vscode';
import { CsharpClassView as CsharpClassViewDataProvider } from './CsharpClassView';

export async function activate(context: vscode.ExtensionContext) {
	console.log('Activating C# Class View...');

	const isWorkspaceOpen = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0;
	const workspaceRoot = isWorkspaceOpen ? vscode.workspace.workspaceFolders![0].uri.fsPath : undefined;

	if (workspaceRoot) {

		const csharpClassView = new CsharpClassViewDataProvider(workspaceRoot);
		await csharpClassView.initializeCache();
		const csharpClassViewDataProvider = vscode.window.registerTreeDataProvider('csharpClassView', csharpClassView);
		context.subscriptions.push(csharpClassViewDataProvider);

		const csharpClassViewRefreshCommand 
			= vscode.commands.registerCommand(
				'csharpClassView.refreshCsharpClassExplorer', 
				() => csharpClassView.refresh()
			);
		context.subscriptions.push(csharpClassViewRefreshCommand);


		console.log('Activated C# Class View!');
	} else {
		console.log('No workspace is open!');
	}
}

export function deactivate() {
	console.log('Deactivated C# Class View!');
}
