import ts = require("typescript/lib/tsserverlibrary");

/**
 * Represents a typescript-diagnostic.
 */
export class Diagnostic
{
    /**
     * The typescript-server.
     */
    private tsServer: typeof ts;

    /**
     * The original diagnostic represented by this instance.
     */
    private diagnostic: ts.server.protocol.Diagnostic | ts.server.protocol.DiagnosticWithLinePosition;

    /**
     * Initializes a new instance of the `Diagnostic` class.
     *
     * @param tsServer
     * The typescript-server.
     *
     * @param diagnostic
     * The diagnostic to represent by this instance.
     */
    public constructor(tsServer: typeof ts, diagnostic: ts.server.protocol.Diagnostic | ts.server.protocol.DiagnosticWithLinePosition)
    {
        this.tsServer = tsServer;
        this.diagnostic = diagnostic;
    }

    /**
     * Gets the typescript-server of the diagnostic.
     */
    public get TSServer(): typeof ts
    {
        return this.tsServer;
    }

    /**
     * Gets the original diagnostic represented by this instance.
     */
    public get Diagnostic(): ts.server.protocol.Diagnostic | ts.server.protocol.DiagnosticWithLinePosition
    {
        return this.diagnostic;
    }

    /**
     * Gets the location of the start of the diagnostic.
     */
    public get Start(): ts.server.protocol.Location
    {
        return this.IsNormalDiagnostic(this.diagnostic) ?
            this.diagnostic.start :
            this.diagnostic.startLocation;
    }

    /**
     * Gets the location of the end of the diagnostic.
     */
    public get End(): ts.server.protocol.Location
    {
        return this.IsNormalDiagnostic(this.diagnostic) ?
            this.diagnostic.end :
            this.diagnostic.endLocation;
    }

    /**
     * Gets the error code of the diagnostic.
     */
    public get Code(): number
    {
        return this.diagnostic.code;
    }

    /**
     * Gets the source of the diagnostic.
     */
    public get Source(): string
    {
        return this.IsNormalDiagnostic(this.diagnostic) ?
            this.diagnostic.source :
            null;
    }

    /**
     * Gets the message of the diagnostic.
     */
    public get Message(): string
    {
        return this.IsNormalDiagnostic(this.diagnostic) ?
            this.diagnostic.text :
            this.diagnostic.message;
    }

    /**
     * Gets the category of the diagnostic.
     */
    public get Category(): string
    {
        return this.diagnostic.category;
    }

    /**
     * Gets related diagnostics.
     */
    public get RelatedInformation(): ts.server.protocol.DiagnosticRelatedInformation[]
    {
        return this.diagnostic.relatedInformation;
    }

    /**
     * Determines whether the specified `diagnostic` is a normal diagnostic.
     *
     * @param diagnostic
     * The diagnostic to check.
     *
     * @returns
     * A value indicating whether the diagnostic is a normal diagnostic.
     */
    public IsNormalDiagnostic(diagnostic: ts.server.protocol.Diagnostic | ts.server.protocol.DiagnosticWithLinePosition): diagnostic is ts.server.protocol.Diagnostic
    {
        return "text" in diagnostic;
    }
}
