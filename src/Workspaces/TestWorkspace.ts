import { spawnSync } from "child_process";
import { Package } from "@manuth/package-json-editor";
import { ensureFile, pathExistsSync, writeFile, writeJSON } from "fs-extra";
import npmWhich = require("npm-which");
import { fileName, TSConfigJSON } from "types-tsconfig";
import type ts = require("typescript/lib/tsserverlibrary");
import { join } from "upath";
import { Constants } from "../Constants";
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
     * Initializes a new instance of the {@link TestWorkspace `TestWorkspace`} class.
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
     * Gets the typescript-server library.
     */
    public get TSServerLibrary(): typeof ts
    {
        return this.Tester.TSServerLibrary;
    }

    /**
     * Gets the error-codes to test.
     */
    public get ErrorCodes(): number[]
    {
        return this.Tester.ErrorCodes;
    }

    /**
     * Gets the full path to the `package.json`-file.
     */
    protected get PackageFileName(): string
    {
        return this.MakePath("package.json");
    }

    /**
     * Gets the package for installing a new environment for the languageservice tester.
     */
    protected get InstallerPackage(): Package
    {
        let result: Package;

        if (pathExistsSync(this.PackageFileName))
        {
            result = new Package(this.PackageFileName);
        }
        else
        {
            result = new Package();
            result.Private = true;
        }

        let basePackage = Constants.Package;

        let dependencies = [
            "typescript"
        ];

        for (let dependency of dependencies)
        {
            if (!result.AllDependencies.Has(dependency))
            {
                result.DevelopmentDependencies.Add(
                    dependency,
                    basePackage.AllDependencies.Get(dependency));
            }
        }

        return result;
    }

    /**
     * Initializes the languageservice tester.
     */
    public async Install(): Promise<void>
    {
        let npmPackage = this.InstallerPackage;
        await writeFile(this.MakePath("package.json"), JSON.stringify(npmPackage.ToJSON(), null, 2));

        spawnSync(
            npmWhich(this.MakePath()).sync("npm"),
            [
                "install",
                "--silent"
            ],
            {
                cwd: this.MakePath()
            });
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
     * Configures the workspace.
     *
     * @param tsConfig
     * The TypeScript-settings to apply.
     */
    public async Configure(tsConfig?: TSConfigJSON): Promise<void>
    {
        return writeJSON(this.MakePath(fileName), tsConfig ?? {});
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
                command: this.TSServer.TSServerLibrary.server.protocol.CommandTypes.Open,
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
                command: this.Tester.TSServer.TSServerLibrary.server.protocol.CommandTypes.ReloadProjects
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
                    command: this.TSServerLibrary.server.protocol.CommandTypes.SemanticDiagnosticsSync,
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
