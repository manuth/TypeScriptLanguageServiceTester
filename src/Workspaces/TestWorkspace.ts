import { ensureFile } from "fs-extra";
import ts = require("typescript/lib/tsserverlibrary");
import { join } from "upath";
import { DiagnosticsResponseAnalyzer } from "../Diagnostics/DiagnosticsResponseAnalyzer";
import { LanguageServiceTester } from "../LanguageServiceTester";
import { TSServer } from "../TSServer";

/**
 * Represents a workspace for testing purposes.
 */
export class TestWorkspace
{
    /**
     * The tester of the workspace.
     */
    private readonly tester: LanguageServiceTester;

    /**
     * The path to the directory of the workspace.
     */
    private readonly workspacePath: string;

    /**
     * Initializes a new instance of the `TestWorkspace` class.
     *
     * @param tester
     * The tester of the workspace.
     *
     * @param workspacePath
     * The path to the directory of the workspace.
     */
    public constructor(tester: LanguageServiceTester, workspacePath: string)
    {
        this.tester = tester;
        this.workspacePath = workspacePath;
    }

    /**
     * Gets the path to the directory of the workspace.
     */
    public get WorkspacePath(): string
    {
        return this.workspacePath;
    }

    /**
     * Gets the tester of the workspace.
     */
    public get Tester(): LanguageServiceTester
    {
        return this.tester;
    }

    /**
     * Gets the typescript-server to test.
     */
    public get TSServer(): TSServer
    {
        return this.Tester.TSServer;
    }

    /**
     * Gets the error-codes to test.
     */
    public get ErrorCodes(): number[]
    {
        return this.Tester.ErrorCodes;
    }

    /**
     * Creates a path relative to the workspace-directory.
     *
     * @param path
     * The path to join.
     *
     * @returns
     * The joined path.
     */
    public MakePath(...path: string[]): string
    {
        return join(this.WorkspacePath, ...path);
    }

    /**
     * Performs an on-the-fly configuration update of the specified plugin.
     *
     * @param name
     * The name of the plugin to configure.
     *
     * @param configuration
     * The configuration to apply.
     */
    public async ConfigurePlugin<TName extends string>(name: TName, configuration: unknown): Promise<void>
    {
        await this.TSServer.Send<ts.server.protocol.ConfigurePluginRequest>(
            {
                type: "request",
                command: ts.server.protocol.CommandTypes.ConfigurePlugin,
                arguments: {
                    pluginName: name,
                    configuration
                }
            },
            true);
    }

    /**
     * Sends a file to the server.
     *
     * @param file
     * The file to send.
     *
     * @param code
     * The content to add to the file.
     *
     * @param scriptKind
     * The type of the file to send.
     */
    public async SendFile(file: string, code: string, scriptKind?: ts.server.protocol.ScriptKindName): Promise<void>
    {
        await this.TSServer.Send<ts.server.protocol.OpenRequest>(
            {
                type: "request",
                command: ts.server.protocol.CommandTypes.Open,
                arguments: {
                    file,
                    fileContent: code,
                    scriptKindName: scriptKind ?? "TS"
                }
            },
            false);

        await this.TSServer.Send(
            {
                type: "request",
                command: ts.server.protocol.CommandTypes.ReloadProjects
            },
            false);
    }

    /**
     * Checks a code for diagnostics.
     *
     * @param code
     * The code to check.
     *
     * @param scriptKind
     * The name of the script-kind to open.
     *
     * @param fileName
     * The name of the file to check.
     *
     * @returns
     * The response of the code-analysis.
     */
    public async AnalyzeCode(code: string, scriptKind: ts.server.protocol.ScriptKindName = "TS", fileName?: string): Promise<DiagnosticsResponseAnalyzer>
    {
        let file = fileName ?? this.GetTestFileName(scriptKind);
        await ensureFile(file);
        await this.SendFile(file, code, scriptKind);

        return new DiagnosticsResponseAnalyzer(
            await this.TSServer.Send<ts.server.protocol.SemanticDiagnosticsSyncRequest>(
                {
                    type: "request",
                    command: ts.server.protocol.CommandTypes.SemanticDiagnosticsSync,
                    arguments: {
                        file,
                        includeLinePosition: false
                    }
                },
                true),
                this,
                scriptKind,
                file);
    }

    /**
     * Disposes the test-workspace.
     */
    public async Dispose(): Promise<void>
    { }

    /**
     * Gets a filename of a script for the specified script-kind to test.
     *
     * @param scriptKind
     * The name of the script-kind to get a file for.
     *
     * @returns
     * The file-name for the specified script-kind.
     */
    protected GetTestFileName(scriptKind: ts.server.protocol.ScriptKindName): string
    {
        let fileName: string;

        switch (scriptKind)
        {
            case "JSX":
                fileName = "javascript-react.jsx";
                break;
            case "JS":
                fileName = "javascript.js";
                break;
            case "TSX":
                fileName = "typescript-react.tsx";
                break;
            case "TS":
            default:
                fileName = "typescript.ts";
                break;
        }

        return this.MakePath("src", fileName);
    }
}
