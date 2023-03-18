import type { server } from "typescript/lib/tsserverlibrary.js";

/**
 * Represents a code-action.
 */
export class CodeAction
{
    /**
     * The original code action represented by this instance.
     */
    private codeAction: server.protocol.CodeAction | server.protocol.CodeFixAction;

    /**
     * Initializes a new instance of the {@linkcode CodeAction} class.
     *
     * @param codeAction
     * The code-action to represent.
     */
    public constructor(codeAction: server.protocol.CodeAction | server.protocol.CodeFixAction)
    {
        this.codeAction = codeAction;
    }

    /**
     * Gets the original code action represented by this instance.
     */
    public get CodeAction(): server.protocol.CodeAction | server.protocol.CodeFixAction
    {
        return this.codeAction;
    }

    /**
     * Gets the name of the fix.
     */
    public get FixName(): string | undefined
    {
        return CodeAction.IsCodeFixAction(this.CodeAction) ?
            this.CodeAction.fixName :
            undefined;
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
    public get FixAllDescription(): string | undefined
    {
        return CodeAction.IsCodeFixAction(this.CodeAction) ?
            this.CodeAction.fixAllDescription :
            undefined;
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
    public get Changes(): server.protocol.FileCodeEdits[]
    {
        return this.CodeAction.changes;
    }

    /**
     * Gets the commands to pass to the {@linkcode server.protocol.ApplyCodeActionCommandRequest}.
     */
    public get Commands(): unknown[]
    {
        return this.CodeAction.commands ?? [];
    }

    /**
     * Determines whether the specified {@linkcode codeAction} is a normal code-action.
     *
     * @param codeAction
     * The code-action to check.
     *
     * @returns
     * A value indicating whether the specified {@linkcode codeAction} is a normal code-action.
     */
    public static IsCodeFixAction(codeAction: server.protocol.CodeAction | server.protocol.CodeFixAction): codeAction is server.protocol.CodeFixAction
    {
        let key = nameof<server.protocol.CodeFixAction>((action) => action.fixName) as keyof server.protocol.CodeFixAction;
        return key in codeAction;
    }
}
