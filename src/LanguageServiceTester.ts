import { TempDirectory } from "@manuth/temp-files";
import { ensureDirSync } from "fs-extra";
import { server } from "typescript/lib/tsserverlibrary";
import { DiagnosticsResponseAnalyzer } from "./Diagnostics/DiagnosticsResponseAnalyzer";
import { TSServer } from "./TSServer";
import { TestWorkspace } from "./Workspaces/TestWorkspace";

/**
 * Provides functions for testing the plugin.
 */
export abstract class LanguageServiceTester
{
    /**
     * The working directory to set for the tsserver.
     */
    private workingDirectory: string;

    /**
     * The typescript-server for testing.
     */
    private tsServer: TSServer = null;

    /**
     * The default workspace for testing.
     */
    private defaultWorkspace: TestWorkspace = null;

    /**
     * A set of temporary workspaces which are attached to this tester.
     */
    private readonly tempWorkspaces: TestWorkspace[] = [];

    /**
     * A set of temporary directories containing the temporary workspaces.
     */
    private readonly tempDirectories: TempDirectory[] = [];

    /**
     * Initializes a new instance of the `LanguageServiceTester` class.
     *
     * @param workingDirectory
     * The working directory to set for the default workspace.
     */
    public constructor(workingDirectory: string)
    {
        this.workingDirectory = workingDirectory;
    }

    /**
     * Gets the typescript-server for testing.
     */
    public get TSServer(): TSServer
    {
        if (this.tsServer === null)
        {
            ensureDirSync(this.WorkingDirectory);
            this.tsServer = new TSServer(this.WorkingDirectory);
        }

        return this.tsServer;
    }

    /**
     * Gets the working directory of the tester.
     */
    public get WorkingDirectory(): string
    {
        return this.workingDirectory;
    }

    /**
     * Gets the default workspace for testing.
     */
    public get DefaultWorkspace(): TestWorkspace
    {
        if (this.defaultWorkspace === null)
        {
            ensureDirSync(this.WorkingDirectory);
            this.defaultWorkspace = this.CreateWorkspace(this.WorkingDirectory);
        }

        return this.defaultWorkspace;
    }

    /**
     * Gets the error-codes to test.
     */
    public abstract get ErrorCodes(): number[];

    /**
     * Gets a set of temporary workspaces which are attached to this tester.
     */
    public get TempWorkspaces(): readonly TestWorkspace[]
    {
        return this.tempWorkspaces;
    }

    /**
     * Initializes the languageservice tester.
     */
    public async Install(): Promise<void>
    {
        return this.DefaultWorkspace.Install();
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
        return this.DefaultWorkspace.MakePath(...path);
    }

    /**
     * Creates a new temporary workspace.
     *
     * @returns
     * The newly created temporary workspace.
     */
    public async CreateTemporaryWorkspace(): Promise<TestWorkspace>
    {
        let tempDir = new TempDirectory();
        let result = this.CreateWorkspace(tempDir.FullName);
        this.tempWorkspaces.push(result);
        this.tempDirectories.push(tempDir);
        return result;
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
        await this.TSServer.Send<server.protocol.ConfigurePluginRequest>(
            {
                type: "request",
                command: server.protocol.CommandTypes.ConfigurePlugin,
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
    public async SendFile(file: string, code: string, scriptKind?: server.protocol.ScriptKindName): Promise<void>
    {
        return this.DefaultWorkspace.SendFile(file, code, scriptKind);
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
    public async AnalyzeCode(code: string, scriptKind?: server.protocol.ScriptKindName, fileName?: string): Promise<DiagnosticsResponseAnalyzer>
    {
        return this.DefaultWorkspace.AnalyzeCode(code, scriptKind, fileName);
    }

    /**
     * Disposes the plugin-tester.
     */
    public async Dispose(): Promise<void>
    {
        await this.DefaultWorkspace.Dispose();
        await this.TSServer.Dispose();

        for (let tempWorkspace of this.TempWorkspaces)
        {
            await tempWorkspace.Dispose();
        }

        for (let tempDirectory of this.tempDirectories)
        {
            try
            {
                tempDirectory.Dispose();
            }
            catch { }
        }
    }

    /**
     * Creates a new workspace.
     *
     * @param workspacePath
     * The path to the workspace to create.
     *
     * @returns
     * The newly created workspace.
     */
    protected CreateWorkspace(workspacePath: string): TestWorkspace
    {
        return new TestWorkspace(this, workspacePath);
    }
}
