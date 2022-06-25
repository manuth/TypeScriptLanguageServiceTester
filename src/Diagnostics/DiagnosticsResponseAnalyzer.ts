import type { server } from "typescript/lib/tsserverlibrary.js";
import { TSServer } from "../TSServer.js";
import { TestWorkspace } from "../Workspaces/TestWorkspace.js";
import { CodeAction } from "./Actions/CodeAction.js";
import { Diagnostic } from "./Diagnostic.js";
import { ICodeAnalysisResult } from "./ICodeAnalysisResult.js";

/**
 * Provides the functionality to analyze a diagnostic-response.
 */
export class DiagnosticsResponseAnalyzer
{
    /**
     * The result to analysis.
     */
    private codeAnalysisResult: Readonly<ICodeAnalysisResult>;

    /**
     * The workspace of this diagnostic-response.
     */
    private workspace: TestWorkspace;

    /**
     * The script-kind of the file of this response.
     */
    private scriptKind: server.protocol.ScriptKindName;

    /**
     * The name of the file of this response.
     */
    private fileName: string;

    /**
     * Initializes a new instance of the {@link DiagnosticsResponseAnalyzer `DiagnosticsResponseAnalyzer`} class.
     *
     * @param codeAnalysisResult
     * The response to analyze.
     *
     * @param workspace
     * The workspace of the response.
     *
     * @param scriptKind
     * The script-kind of the file of the response.
     *
     * @param fileName
     * The name of the file of the response.
     */
    public constructor(codeAnalysisResult: ICodeAnalysisResult, workspace: TestWorkspace, scriptKind: server.protocol.ScriptKindName, fileName: string)
    {
        this.codeAnalysisResult = codeAnalysisResult;
        this.workspace = workspace;
        this.scriptKind = scriptKind;
        this.fileName = fileName;
    }

    /**
     * Gets the workspace of the diagnostic-response.
     */
    public get Workspace(): TestWorkspace
    {
        return this.workspace;
    }

    /**
     * Gets the script-kind of the file of this diagnostic.
     */
    public get ScriptKind(): server.protocol.ScriptKindName
    {
        return this.scriptKind;
    }

    /**
     * Gets the name of the file of this diagnostic.
     */
    public get FileName(): string
    {
        return this.fileName;
    }

    /**
     * Gets the typescript-server.
     */
    public get TSServer(): TSServer
    {
        return this.Workspace.TSServer;
    }

    /**
     * Gets the result of the analysis.
     */
    public get CodeAnalysisResult(): ICodeAnalysisResult
    {
        return this.codeAnalysisResult;
    }

    /**
     * Gets the diagnostics.
     */
    public get Diagnostics(): Diagnostic[]
    {
        let diagnostics: Array<server.protocol.Diagnostic | server.protocol.DiagnosticWithLinePosition> = [
            ...this.CodeAnalysisResult.SemanticDiagnosticsResponse.body,
            ...this.CodeAnalysisResult.SyntacticDiagnosticsResponse.body
        ];

        return diagnostics.map((diagnostic) => new Diagnostic(this, diagnostic));
    }

    /**
     * Gets the code-fixes of the diagnostics.
     *
     * @returns
     * The code-fixes of the diagnostics.
     */
    public async GetCodeFixes(): Promise<CodeAction[]>
    {
        return (await Promise.all(
            this.Diagnostics.map(
                (diagnostic) => diagnostic.GetCodeFixes()))).flatMap(
                    (fixResponse) => fixResponse.Fixes);
    }
}
