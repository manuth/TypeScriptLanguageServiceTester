import { server } from "typescript/lib/tsserverlibrary";

/**
 * Represents the result of a code-analysis.
 */
export interface ICodeAnalysisResult
{
    /**
     * Gets or sets the response of the {@link server.protocol.CommandTypes.SemanticDiagnosticsSync `SemanticDiagnosticsSync`}-command.
     */
    SemanticDiagnosticsResponse: server.protocol.SemanticDiagnosticsSyncResponse;

    /**
     * Gets or sets the response of the {@link server.protocol.CommandTypes.SyntacticDiagnosticsSync `SyntacticDiagnosticsSync`}-command.
     */
    SyntacticDiagnosticsResponse: server.protocol.SyntacticDiagnosticsSyncResponse;
}
