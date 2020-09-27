import ts = require("typescript/lib/tsserverlibrary");
import { TSServer } from "../TSServer";
import { TestWorkspace } from "../Workspaces/TestWorkspace";

/**
 * Represents a typescript-diagnostic.
 */
export class Diagnostic
{
    /**
     * The typescript-server.
     */
    private workspace: TestWorkspace;

    /**
     * The script-kind of the file containing this diagnostic.
     */
    private scriptKind: ts.ScriptKind;

    /**
     * The original diagnostic represented by this instance.
     */
    private diagnostic: ts.server.protocol.Diagnostic | ts.server.protocol.DiagnosticWithLinePosition;

    /**
     * Initializes a new instance of the `Diagnostic` class.
     *
     * @param workspace
     * The workspace of the diagnostic.
     *
     * @param scriptKind
     * The kind of the script this diagnostic belongs to.
     *
     * @param diagnostic
     * The diagnostic to represent by this instance.
     */
    public constructor(workspace: TestWorkspace, scriptKind: ts.ScriptKind, diagnostic: ts.server.protocol.Diagnostic | ts.server.protocol.DiagnosticWithLinePosition)
    {
        this.workspace = workspace;
        this.diagnostic = diagnostic;
    }

    /**
     * Gets the workspace of the diagnostic.
     */
    public get Workspace(): TestWorkspace
    {
        return this.workspace;
    }

    /**
     * Gets the kind of the script of this diagnostic.
     */
    public get ScriptKind(): ts.ScriptKind
    {
        return this.scriptKind;
    }

    /**
     * Gets the typescript-server of the diagnostic.
     */
    public get TSServer(): TSServer
    {
        return this.Workspace.TSServer;
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
        return Diagnostic.IsNormalDiagnostic(this.Diagnostic) ?
            this.Diagnostic.start :
            this.Diagnostic.startLocation;
    }

    /**
     * Gets the location of the end of the diagnostic.
     */
    public get End(): ts.server.protocol.Location
    {
        return Diagnostic.IsNormalDiagnostic(this.Diagnostic) ?
            this.Diagnostic.end :
            this.Diagnostic.endLocation;
    }

    /**
     * Gets the error code of the diagnostic.
     */
    public get Code(): number
    {
        return this.Diagnostic.code;
    }

    /**
     * Gets the source of the diagnostic.
     */
    public get Source(): string
    {
        return Diagnostic.IsNormalDiagnostic(this.Diagnostic) ?
            this.Diagnostic.source :
            null;
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
    public get RelatedInformation(): ts.server.protocol.DiagnosticRelatedInformation[]
    {
        return this.Diagnostic.relatedInformation;
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
    public static IsNormalDiagnostic(diagnostic: ts.server.protocol.Diagnostic | ts.server.protocol.DiagnosticWithLinePosition): diagnostic is ts.server.protocol.Diagnostic
    {
        return "text" in diagnostic;
    }
}
