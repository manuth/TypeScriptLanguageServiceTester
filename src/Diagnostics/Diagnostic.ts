import type { server } from "typescript/lib/tsserverlibrary.js";
import { FixResponseAnalyzer } from "./Actions/FixResponseAnalyzer.js";
import { DiagnosticsResponseAnalyzer } from "./DiagnosticsResponseAnalyzer.js";
import { TSServer } from "../TSServer.js";
import { TestWorkspace } from "../Workspaces/TestWorkspace.js";

/**
 * Represents a typescript-diagnostic.
 */
export class Diagnostic
{
    /**
     * The response this diagnostic belongs to.
     */
    private response: DiagnosticsResponseAnalyzer;

    /**
     * The original diagnostic represented by this instance.
     */
    private diagnostic: server.protocol.Diagnostic | server.protocol.DiagnosticWithLinePosition;

    /**
     * Initializes a new instance of the {@linkcode Diagnostic} class.
     *
     * @param response
     * The response this diagnostic belongs to.
     *
     * @param diagnostic
     * The diagnostic to represent by this instance.
     */
    public constructor(response: DiagnosticsResponseAnalyzer, diagnostic: server.protocol.Diagnostic | server.protocol.DiagnosticWithLinePosition)
    {
        this.response = response;
        this.diagnostic = diagnostic;
    }

    /**
     * Gets the response this diagnostic belongs to.
     */
    public get Response(): DiagnosticsResponseAnalyzer
    {
        return this.response;
    }

    /**
     * Gets the typescript-server of the diagnostic.
     */
    public get TSServer(): TSServer
    {
        return this.Response.TSServer;
    }

    /**
     * Gets the workspace of the diagnostic.
     */
    public get Workspace(): TestWorkspace
    {
        return this.Response.Workspace;
    }

    /**
     * Gets the original diagnostic represented by this instance.
     */
    public get Diagnostic(): server.protocol.Diagnostic | server.protocol.DiagnosticWithLinePosition
    {
        return this.diagnostic;
    }

    /**
     * Gets the location of the start of the diagnostic.
     */
    public get Start(): server.protocol.Location
    {
        return Diagnostic.IsNormalDiagnostic(this.Diagnostic) ?
            this.Diagnostic.start :
            this.Diagnostic.startLocation;
    }

    /**
     * Gets the location of the end of the diagnostic.
     */
    public get End(): server.protocol.Location
    {
        return Diagnostic.IsNormalDiagnostic(this.Diagnostic) ?
            this.Diagnostic.end :
            this.Diagnostic.endLocation;
    }

    /**
     * Gets the error code of the diagnostic.
     */
    public get Code(): number | undefined
    {
        return this.Diagnostic.code;
    }

    /**
     * Gets the source of the diagnostic.
     */
    public get Source(): string | undefined
    {
        return {
            source: undefined,
            ...this.Diagnostic
        }.source;
    }

    /**
     * Gets the message of the diagnostic.
     */
    public get Message(): string
    {
        return Diagnostic.IsNormalDiagnostic(this.Diagnostic) ?
            this.Diagnostic.text :
            this.Diagnostic.message;
    }

    /**
     * Gets the category of the diagnostic.
     */
    public get Category(): string
    {
        return this.Diagnostic.category;
    }

    /**
     * Gets related diagnostics.
     */
    public get RelatedInformation(): server.protocol.DiagnosticRelatedInformation[]
    {
        return this.Diagnostic.relatedInformation ?? [];
    }

    /**
     * Determines whether the specified {@linkcode diagnostic} is a normal diagnostic.
     *
     * @param diagnostic
     * The diagnostic to check.
     *
     * @returns
     * A value indicating whether the diagnostic is a normal diagnostic.
     */
    public static IsNormalDiagnostic(diagnostic: server.protocol.Diagnostic | server.protocol.DiagnosticWithLinePosition): diagnostic is server.protocol.Diagnostic
    {
        let key = nameof<server.protocol.Diagnostic>((diagnostic) => diagnostic.text);
        return key in diagnostic;
    }

    /**
     * Looks for code-fixes for this diagnostic.
     *
     * @returns
     * The code-fixes for this diagnostic.
     */
    public async GetCodeFixes(): Promise<FixResponseAnalyzer>
    {
        return new FixResponseAnalyzer(
            await this.TSServer.Send<server.protocol.CodeFixRequest>(
                {
                    type: "request",
                    command: this.TSServer.TSServerLibrary.server.protocol.CommandTypes.GetCodeFixes,
                    arguments: {
                        file: this.Response.FileName,
                        startLine: this.Start.line,
                        startOffset: this.Start.offset,
                        endLine: this.End.line,
                        endOffset: this.End.offset,
                        errorCodes: this.Workspace.ErrorCodes
                    }
                },
                true));
    }
}
