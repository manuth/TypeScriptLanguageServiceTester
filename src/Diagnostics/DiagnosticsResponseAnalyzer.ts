import ts = require("typescript/lib/tsserverlibrary");
import { TSServer } from "../TSServer";
import { TestWorkspace } from "../Workspaces/TestWorkspace";
import { Diagnostic } from "./Diagnostic";
import { DiagnosticPredicate } from "./DiagnosticPredicate";

/**
 * Provides the functionality to analyze a diagnostic-response.
 */
export class DiagnosticsResponseAnalyzer
{
    /**
     * The response to analyze.
     */
    private diagnosticsResponse: ts.server.protocol.SemanticDiagnosticsSyncResponse;

    /**
     * The workspace of this diagnostic-response.
     */
    private workspace: TestWorkspace;

    /**
     * The script-kind of the file of this response.
     */
    private scriptKind: ts.server.protocol.ScriptKindName;

    /**
     * The name of the file of this response.
     */
    private fileName: string;

    /**
     * Initializes a new instance of the `DiagnosticsResponseAnalyzer` class.
     *
     * @param diagnostsResponse
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
    public constructor(diagnostsResponse: ts.server.protocol.SemanticDiagnosticsSyncResponse, workspace: TestWorkspace, scriptKind: ts.server.protocol.ScriptKindName, fileName: string)
    {
        this.diagnosticsResponse = diagnostsResponse;
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
    public get ScriptKind(): ts.server.protocol.ScriptKindName
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
     * Gets the response to analyze.
     */
    public get DiagnosticsResponse(): ts.server.protocol.SemanticDiagnosticsSyncResponse
    {
        return this.diagnosticsResponse;
    }

    /**
     * Gets the diagnostics.
     */
    public get Diagnostics(): Diagnostic[]
    {
        let diagnostics: Array<ts.server.protocol.Diagnostic | ts.server.protocol.DiagnosticWithLinePosition>;
        diagnostics = this.DiagnosticsResponse.body;
        return diagnostics.map((diagnostic) => new Diagnostic(this, diagnostic));
    }

    /**
     * Looks for diagnostics which apply to the specified `predicate`.
     *
     * @param predicate
     * A predicate for filtering the diagnostics
     *
     * @returns
     * The diagnostics which apply to the specified `predicate`.
     */
    public Filter(predicate: DiagnosticPredicate): Diagnostic[]
    {
        return this.Diagnostics.filter((diagnostic) => predicate(diagnostic));
    }
}
