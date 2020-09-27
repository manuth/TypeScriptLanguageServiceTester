import ts = require("typescript/lib/tsserverlibrary");
import { TSServer } from "../TSServer";
import { Diagnostic } from "./Diagnostic";
import { DiagnosticPredicate } from "./DiagnosticPredicate";

/**
 * Provides the functionality to analyze a diagnostic-response.
 */
export class DiagnosticsResponseAnalyzer
{
    /**
     * The typescript-server.
     */
    private tsServer: TSServer;

    /**
     * The response to analyze.
     */
    private diagnosticsResponse: ts.server.protocol.SemanticDiagnosticsSyncResponse;

    /**
     * Initializes a new instance of the `DiagnosticsResponseAnalyzer` class.
     *
     * @param diagnostsResponse
     * The response to analyze.
     */
    public constructor(diagnostsResponse: ts.server.protocol.SemanticDiagnosticsSyncResponse)
    {
        this.diagnosticsResponse = diagnostsResponse;
    }

    /**
     * Gets the typescript-server.
     */
    public get TSServer(): TSServer
    {
        return this.tsServer;
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
        return diagnostics.map((diagnostic) => new Diagnostic(this.TSServer, diagnostic));
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
