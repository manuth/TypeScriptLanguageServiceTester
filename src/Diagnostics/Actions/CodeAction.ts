/**
 * Represents a code-action.
 */
export class CodeAction
{
    /**
     * The original code action represented by this instance.
     */
    private codeAction: ts.server.protocol.CodeAction | ts.server.protocol.CodeFixAction;

    /**
     * Initializes a new instance of the `CodeAction` class.
     *
     * @param codeAction
     * The code-action to represent by this instance.
     */
    public constructor(codeAction: ts.server.protocol.CodeAction | ts.server.protocol.CodeFixAction)
    {
        this.codeAction = codeAction;
    }

    /**
     * Gets the original code action represented by this instance.
     */
    public get CodeAction(): ts.server.protocol.CodeAction | ts.server.protocol.CodeFixAction
    {
        return this.codeAction;
    }

    /**
     * Gets the name of the fix.
     */
    public get FixName(): string
    {
        return CodeAction.IsCodeFixAction(this.CodeAction) ?
            this.CodeAction.fixName :
            null;
    }

    /**
     * Gets the id of the fix.
     */
    public get FixID(): unknown
    {
        return CodeAction.IsCodeFixAction(this.CodeAction) ?
            this.CodeAction.fixId :
            null;
    }

    /**
     * Gets a description for the fix-all action.
     */
    public get FixAllDescription(): string
    {
        return CodeAction.IsCodeFixAction(this.CodeAction) ?
            this.CodeAction.fixAllDescription :
            null;
    }

    /**
     * Gets the description of the code-action.
     */
    public get Description(): string
    {
        return this.CodeAction.description;
    }

    /**
     * Gets the changes of the code-action.
     */
    public get Changes(): ts.server.protocol.FileCodeEdits[]
    {
        return this.CodeAction.changes;
    }

    /**
     * Gets the commands to pass to the `ApplyCodeActionCommandRequest`.
     */
    public get Commands(): unknown[]
    {
        return this.CodeAction.commands;
    }

    /**
     * Determines whether the specified `codeAction` is a normal code-action.
     *
     * @param codeAction
     * The code-action to check.
     *
     * @returns
     * A value indicating whether the specified `codeAction` is a normal code-action.
     */
    public static IsCodeFixAction(codeAction: ts.server.protocol.CodeAction | ts.server.protocol.CodeFixAction): codeAction is ts.server.protocol.CodeFixAction
    {
        return "fixName" in codeAction;
    }
}
