import * as vscode from 'vscode';
import { randomUUID } from 'crypto';
import { Logger } from './logger';
import { RoslynSolutionService, RoslynSolution, RoslynClass, RoslynInterface, RoslynEnum, RoslynType } from './RoslynSolutionService';

export class CsharpClassView implements vscode.TreeDataProvider<SolutionUnit> {

    private solutionPath: string | undefined;
    private solutionStructure: RoslynSolution | undefined;

    constructor(private workspaceRoot: string | undefined, private readonly logger: Logger) {
        if (!this.workspaceRoot) {
            this.logger.log('No workspace root provided!');
        }
    }

    async initializeCache(): Promise<void> {
        const solutionFiles = await vscode.workspace.findFiles('**/*.sln');

        if (solutionFiles.length === 0) {
            this.solutionPath = undefined;
            this.logger.log('No solution files found in the workspace!');
            return;
        }

        if (solutionFiles.length === 1) {
            this.solutionPath = solutionFiles[0].fsPath;
        } else {
            this.solutionPath = await vscode.window.showQuickPick(
                solutionFiles.map(file => file.fsPath),
                { placeHolder: 'Select a solution file.' }
            );
        }

        try {
            const roslynSolutionService = new RoslynSolutionService(this.solutionPath!, this.logger);
            this.solutionStructure = await roslynSolutionService.getSolution();
        } catch (error) {
            this.logger.log(`Error parsing solution structure at '${this.solutionPath}', error ${error}`);
            this.solutionStructure = undefined;
        }
    }

    async getChildren(element?: SolutionUnit): Promise<SolutionUnit[]> {
        if (!this.solutionStructure) {
            this.logger.log('Solution structure has not been cached!');
            return Promise.resolve([]);
        }

        if (element) { return Promise.resolve(this.getRoslynUnits(element)); }

        return Promise.resolve(this.getRoslynUnits());

    }

    getTreeItem(node: SolutionUnit): vscode.TreeItem { return node; }

    private _onDidChangeTreeData: vscode.EventEmitter<SolutionUnit | undefined | void> = new vscode.EventEmitter<SolutionUnit | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<SolutionUnit | undefined | void> = this._onDidChangeTreeData.event;

    async refresh(): Promise<void> {
        this.logger.log("Refreshing C# Class View.");
        await this.initializeCache(); 
        this._onDidChangeTreeData.fire();
        this.logger.log("Refreshed C# Class View!");
    }

    private getRoslynUnits(node: SolutionUnit | null = null): SolutionUnit[] {
        if (!this.solutionStructure) {
            return [];
        }

        if (node === null) {
            return [new SolutionUnit(this.solutionStructure.Name, "Solution", null, vscode.TreeItemCollapsibleState.Expanded)];
        }

        if (node.typeId === "Solution") {
            return [...this.solutionStructure.Projects.keys()]
                .map(project => new SolutionUnit(project, "Project", node, vscode.TreeItemCollapsibleState.Collapsed));
        }

        if (node.typeId === "Project") {
            return [...this.solutionStructure.Projects.get(node.label)?.keys()!]
                .map(ns => new SolutionUnit(ns, "Namespace", node, vscode.TreeItemCollapsibleState.Collapsed));
        }

        if (node.typeId === "Namespace") {
            const namespace = this.solutionStructure.Projects.get(node.parent?.label!)!.get(node.label);
            if (!namespace) { return []; }
            return [...namespace.values()].map(roslynUnit => new SolutionUnit(roslynUnit.Name, roslynUnit.GetType() as RoslynType, node, vscode.TreeItemCollapsibleState.Collapsed));
        }

        if (node.typeId === "Class") {
            const roslynClass = this.solutionStructure.Projects.get(node.parent?.parent?.label!)!.get(node.parent?.label!)!.get(node.label) as RoslynClass;

            if (!roslynClass) { return []; }

            const constructors = roslynClass.Constructors.map(ctor => new SolutionUnit(ctor, "Constructor", node, vscode.TreeItemCollapsibleState.None));
            const methods = roslynClass.Methods.map(method => new SolutionUnit(method, "Method", node, vscode.TreeItemCollapsibleState.None));
            const properties = roslynClass.Properties.map(prop => new SolutionUnit(prop, "Property", node, vscode.TreeItemCollapsibleState.None));
            const fields = roslynClass.Fields.map(field => new SolutionUnit(field, "Field", node, vscode.TreeItemCollapsibleState.None));
            const baseClasses = roslynClass.BaseTypes.map(cls => new SolutionUnit(cls, "Class", node, vscode.TreeItemCollapsibleState.None));
            const baseInterfaces = roslynClass.BaseInterfaces.map(intf => new SolutionUnit(intf, "Interface", node, vscode.TreeItemCollapsibleState.None));

            return [...constructors, ...methods, ...properties, ...fields, ...baseClasses, ...baseInterfaces];
        }

        if (node.typeId === "Interface") {
            const roslynInterface = this.solutionStructure.Projects.get(node.parent?.parent?.label!)!.get(node.parent?.label!)!.get(node.label) as RoslynInterface;

            if (!roslynInterface) { return []; }

            const methods = roslynInterface.Methods.map(method => new SolutionUnit(method, "Method", node, vscode.TreeItemCollapsibleState.None));

            return methods;
        }

        if (node.typeId === "Enum") {
            const roslynEnum = this.solutionStructure.Projects.get(node.parent?.parent?.label!)!.get(node.parent?.label!)!.get(node.label) as RoslynEnum;

            if (!roslynEnum) { return []; }

            const methods = roslynEnum.Options.map(opt => new SolutionUnit(opt, "Option", node, vscode.TreeItemCollapsibleState.None));

            return methods;
        }

        return [];
    }
}

export class SolutionUnit extends vscode.TreeItem {

    constructor(public readonly label: string, public readonly typeId: RoslynType, public readonly parent: SolutionUnit | null, public readonly collapsibleState: vscode.TreeItemCollapsibleState) {
        super(label, collapsibleState);

        this.id = randomUUID();
        this.tooltip = this.label;
        this.description = this.typeId.toString();

        this.iconPath = this.getIconPath(this.typeId);
    }

    private getIconPath(typeId: RoslynType): vscode.ThemeIcon {
        switch (typeId) {
            case 'Solution':
                return new vscode.ThemeIcon('package');
            case 'Project':
                return new vscode.ThemeIcon('folder-library');
            case 'Namespace':
                return new vscode.ThemeIcon('symbol-namespace');
            case 'Interface':
                return new vscode.ThemeIcon('symbol-interface');
            case 'Enum':
                return new vscode.ThemeIcon('symbol-enum');
            case 'Option':
                return new vscode.ThemeIcon('symbol-enum-member');
            case 'Class':
                return new vscode.ThemeIcon('symbol-class');
            case 'Constructor':
                return new vscode.ThemeIcon('symbol-constructor');
            case 'Method':
                return new vscode.ThemeIcon('symbol-method');
            case 'Property':
                return new vscode.ThemeIcon('symbol-property');
            case 'Field':
                return new vscode.ThemeIcon('symbol-field');
            default:
                return new vscode.ThemeIcon('symbol-key');
        }
    }

}
