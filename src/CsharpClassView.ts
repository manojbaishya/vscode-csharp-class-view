import path from 'path';
import * as vscode from 'vscode';
import { randomUUID } from 'crypto';
import * as RoslynSolutionService from './RoslynSolutionService';
import { RoslynClassMessage, RoslynEnumMessage, RoslynInterfaceMessage, RoslynProjectMessage, RoslynSolutionMessage } from './gen/syntaxtree_pb';

export class CsharpClassView implements vscode.TreeDataProvider<SolutionUnit> {

    private solutionPath: string | undefined;
    private solutionStructure: RoslynSolutionMessage | undefined;

    constructor(private workspaceRoot: string | undefined) {
        if (!this.workspaceRoot) {
            console.error('No workspace root provided!');
        }
    }

    async initializeCache(): Promise<void> {
        const solutionFiles = await vscode.workspace.findFiles('**/*.sln');

        if (solutionFiles.length === 0) {
            this.solutionPath = undefined;
            console.error('No solution files found in the workspace!');
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
            this.solutionStructure = await RoslynSolutionService.getSolutionStructure(this.solutionPath!);
        } catch (error) {
            console.error("Error parsing solution structure at '", this.solutionPath, "': ", error);
            this.solutionStructure = undefined;
        }

    }

    async getChildren(element?: SolutionUnit): Promise<SolutionUnit[]> {
        if (!this.solutionStructure) {
            console.error('Solution structure has not been cached!');
            return Promise.resolve([]);
        }

        if (element) { return Promise.resolve(this.getRoslynUnits(element)); }

        return Promise.resolve(this.getRoslynUnits());

    }

    getTreeItem(node: SolutionUnit): vscode.TreeItem { return node; }

    private _onDidChangeTreeData: vscode.EventEmitter<SolutionUnit | undefined | void> = new vscode.EventEmitter<SolutionUnit | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<SolutionUnit | undefined | void> = this._onDidChangeTreeData.event;

    refresh(): void { this._onDidChangeTreeData.fire(); }

    private getRoslynUnits(node: SolutionUnit | null = null): SolutionUnit[] {
        if (!this.solutionStructure) {
            return [];
        }

        if (node === null) {
            return [new SolutionUnit(this.solutionStructure.name, "Solution", null, vscode.TreeItemCollapsibleState.Collapsed)];
        }

        if (node.typeId === "Solution") {
            return this.solutionStructure.roslynProjects
                .map(project => new SolutionUnit(project.name, "Project", node, vscode.TreeItemCollapsibleState.Collapsed));
        }

        if (node.typeId === "Project") {
            return this.solutionStructure.roslynProjects.find(project => project.name === node.label)!
                .roslynNamespaces.map(ns => new SolutionUnit(ns.name, "Namespace", node, vscode.TreeItemCollapsibleState.Collapsed));
        }

        if (node.typeId === "Namespace") {
            const namespace = this.solutionStructure.roslynProjects.find(project => project.name === node.parent?.label)!.roslynNamespaces.find(ns => ns.name === node.label);
            if (!namespace) { return []; }

            const classes = namespace.roslynClasses.map(cls => new SolutionUnit(cls.name, "Class", node, vscode.TreeItemCollapsibleState.Collapsed));
            const interfaces = namespace.roslynInterfaces.map(intf => new SolutionUnit(intf.name, "Interface", node, vscode.TreeItemCollapsibleState.Collapsed));
            const enums = namespace.roslynEnums.map(enm => new SolutionUnit(enm.name, "Enum", node, vscode.TreeItemCollapsibleState.Collapsed));
            return [...classes, ...interfaces, ...enums];
        }

        if (node.typeId === "Class") {
            const roslynClass = this.solutionStructure.roslynProjects.find(project => project.name === node.parent?.parent?.label)!.roslynNamespaces.find(ns => ns.name === node.parent?.label)!.roslynClasses.find(cls => cls.name === node.label);

            if (!roslynClass) { return []; }

            const constructors = roslynClass.constructors.map(ctor => new SolutionUnit(ctor, "ClassMember", node, vscode.TreeItemCollapsibleState.None));
            const methods = roslynClass.methods.map(method => new SolutionUnit(method, "ClassMember", node, vscode.TreeItemCollapsibleState.None));
            const properties = roslynClass.properties.map(prop => new SolutionUnit(prop, "ClassMember", node, vscode.TreeItemCollapsibleState.None));
            const fields = roslynClass.fields.map(field => new SolutionUnit(field, "ClassMember", node, vscode.TreeItemCollapsibleState.None));
            const baseClasses = roslynClass.baseClasses.map(cls => new SolutionUnit(cls, "ClassMember", node, vscode.TreeItemCollapsibleState.None));
            const baseInterfaces = roslynClass.baseInterfaces.map(intf => new SolutionUnit(intf, "ClassMember", node, vscode.TreeItemCollapsibleState.None));

            return [...constructors, ...methods, ...properties, ...fields, ...baseClasses, ...baseInterfaces];
        }

        if (node.typeId === "Interface") {
            const roslynInterface = this.solutionStructure.roslynProjects.find(project => project.name === node.parent?.parent?.label)!.roslynNamespaces.find(ns => ns.name === node.parent?.label)!.roslynInterfaces.find(intf => intf.name === node.label);

            if (!roslynInterface) { return []; }

            const methods = roslynInterface.methods.map(method => new SolutionUnit(method, "InterfaceMember", node, vscode.TreeItemCollapsibleState.None));

            return methods;
        }

        if (node.typeId === "Enum") {
            const roslynEnum = this.solutionStructure.roslynProjects.find(project => project.name === node.parent?.parent?.label)!.roslynNamespaces.find(ns => ns.name === node.parent?.label)!.roslynEnums.find(enm => enm.name === node.label);

            if (!roslynEnum) { return []; }

            const methods = roslynEnum.options.map(opt => new SolutionUnit(opt, "EnumMember", node, vscode.TreeItemCollapsibleState.None));

            return methods;
        }

        return [];
    }
}

type RoslynType = "Solution" | "Project" | "Namespace" | "Interface" | "InterfaceMember" | "Enum" | "EnumMember" | "Class" | "ClassMember";

export class SolutionUnit extends vscode.TreeItem {

    constructor(public readonly label: string, public readonly typeId: RoslynType, public readonly parent: SolutionUnit | null, public readonly collapsibleState: vscode.TreeItemCollapsibleState) {
        super(label, collapsibleState);

        this.id = randomUUID();
        this.tooltip = this.label;
        this.description = this.typeId.toString();
    }

    iconPath = {
        light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
        dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
    };
}
