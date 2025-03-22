import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

interface TemplateConfig {
    [key: string]: string;
}

const defaultTemplates: TemplateConfig = {
    Class: "using System;\n\nnamespace {{NAMESPACE}}\n{\n    public class {{NAME}} \n    {\n        public {{NAME}}()\n        {\n        }\n    }\n}",
    Interface: "using System;\n\nnamespace {{NAMESPACE}}\n{\n    public interface {{NAME}} { }\n}",
    Controller: "using Microsoft.AspNetCore.Mvc;\n\nnamespace {{NAMESPACE}}.Controllers\n{\n    [ApiController]\n    [Route(\"api/[controller]\")]\n    public class {{NAME}} : ControllerBase\n    {\n        public {{NAME}}()\n        {\n        }\n\n        [HttpGet]\n        public IActionResult Get() => Ok(\"Getting all {{NAME_NO_SUFFIX}}s\");\n    }\n}",
    DTO: "using System;\n\nnamespace {{NAMESPACE}}.DTOs\n{\n    public class {{NAME}} { }\n}",
    Enum: "using System;\n\nnamespace {{NAMESPACE}}\n{\n    public enum {{NAME}} { }\n}",
    Service: "using System;\n\nnamespace {{NAMESPACE}}.Services\n{\n    public class {{NAME}} \n    {\n        public {{NAME}}()\n        {\n        }\n    }\n}",
    RazorView: "@page \"/{{NAME}}\"\n@model {{NAMESPACE}}.Pages.{{NAME}}Model\n\n<h1>{{NAME}}</h1>",
    CshtmlView: "@model {{NAMESPACE}}.Models.{{NAME}}Model\n\n<h1>{{NAME}}</h1>"
};

function loadTemplates(): TemplateConfig {
    const config = vscode.workspace.getConfiguration('csharpTemplates');
    return { ...defaultTemplates, ...config.get<TemplateConfig>('templates', {}) };
}

function toPascalCase(name: string): string {
    return name.replace(/[^a-zA-Z0-9]/g, '').replace(/(?:^|_|-)(\w)/g, (_, char) => char.toUpperCase());
}

function formatName(name: string, type: string): string {
    let formattedName = toPascalCase(name);
    switch (type) {
        case "Interface": return formattedName.startsWith("I") ? formattedName : `I${formattedName}`;
        case "Controller": return formattedName.endsWith("Controller") ? formattedName : `${formattedName}Controller`;
        case "DTO": return formattedName.endsWith("Dto") ? formattedName : `${formattedName}Dto`;
        case "Service": return formattedName.endsWith("Service") ? formattedName : `${formattedName}Service`;
        default: return formattedName;
    }
}
async function removeFileIfExists(filePath: string) {
    if (fs.existsSync(filePath)) {
        const fileUri = vscode.Uri.file(filePath);
        
        // Check if the file is open in an editor
        const openEditors = vscode.window.visibleTextEditors;
        for (const editor of openEditors) {
            if (editor.document.uri.fsPath === filePath) {
                await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
                break;
            }
        }

        // Delete the file
        try {
            fs.unlinkSync(filePath);
        } catch (error) {
            if (error instanceof Error) {
                vscode.window.showErrorMessage(`Error deleting file: ${error.message}`);
            } else {
                vscode.window.showErrorMessage('Error deleting file: Unknown error occurred.');
            }
        }
    }
}
function generateNamespace(wsPath: string, selectedPath: string): string {
    const projectName = path.basename(wsPath);
    let relativePath = path.relative(wsPath, selectedPath);
    const formattedPath = relativePath.split(path.sep).map(p => toPascalCase(p)).join('.');
    return formattedPath ? `${projectName}.${formattedPath}` : projectName;
}

async function handleNewFile(uri: vscode.Uri) {
    const wsFolder = vscode.workspace.getWorkspaceFolder(uri);
    if (!wsFolder) return;

    const wsPath = wsFolder.uri.fsPath;
    const filePath = uri.fsPath;
    const selectedPath = path.dirname(filePath);
    let baseName = path.basename(filePath, path.extname(filePath));

    // Determine correct file type
    let fileType = "Class";
    if (baseName.endsWith("Controller")) fileType = "Controller";
    else if (baseName.startsWith("I")) fileType = "Interface";
    else if (selectedPath.includes("DTO")) fileType = "DTO";
    else if (selectedPath.includes("Services")) fileType = "Service";
    else if (selectedPath.toLowerCase().includes("views")) fileType = "CshtmlView";
    else {
        fileType = await vscode.window.showQuickPick(
            ["Class", "Interface", "Controller", "DTO", "Enum", "Service"],
            { placeHolder: "Select file type" }
        ) || "Class";
    }

    // Determine correct file extension
    let fileExtension = fileType === "CshtmlView" ? ".cshtml" : ".cs";
    const formattedName = formatName(baseName, fileType);
    const finalFileName = formattedName + fileExtension;
    const correctFilePath = path.join(selectedPath, finalFileName);


	// Prevent duplicate file creation
    if (fs.existsSync(correctFilePath)) {
        vscode.window.showErrorMessage(`File "${finalFileName}" already exists.`);
        return;
    }
	
    // **Check if a file was already created without an extension, rename it**
    // if (fs.existsSync(filePath) && path.extname(filePath) === "") {
        
	// 	const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(filePath));
    // vscode.window.showTextDocument(doc);

	// fs.renameSync(filePath, correctFilePath);
    // }

	 // 🚀 If a file was created without an extension, delete it and close the document
	 if (fs.existsSync(filePath) && path.extname(filePath) === "") {
        await removeFileIfExists(filePath);
    }

    

    const namespace = generateNamespace(wsPath, selectedPath);
    const templates = loadTemplates();

    // Replace template placeholders
    const content = templates[fileType]
        .replace(/{{NAMESPACE}}/g, namespace)
        .replace(/{{NAME}}/g, formattedName)
        .replace(/{{NAME_NO_SUFFIX}}/g, formattedName.replace(/Controller|Dto|Service$/, ''));

    // Write content to file
    fs.writeFileSync(correctFilePath, content);
    const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(correctFilePath));
    vscode.window.showTextDocument(doc);
}

export function activate(context: vscode.ExtensionContext) {
    let watcher = vscode.workspace.onDidCreateFiles(async (event) => {
        for (let file of event.files) {
            await handleNewFile(file);
        }
    });
    context.subscriptions.push(watcher);
}

export function deactivate() {}
