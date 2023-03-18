import { server } from "typescript/lib/tsserverlibrary.js";

/**
 * Represents the result of a code-analysis.
 */
export interface ICodeAnalysisResult
{
    /**
     * Gets or sets the response of the {@linkcode server.protocol.CommandTypes.SemanticDiagnosticsSync}-command.
     */
    SemanticDiagnosticsResponse: server.protocol.SemanticDiagnosticsSyncResponse;

    /**
     * Gets or sets the response of the {@linkcode server.protocol.CommandTypes.SyntacticDiagnosticsSync}-command.
     */
    SyntacticDiagnosticsResponse: server.protocol.SyntacticDiagnosticsSyncResponse;
}
