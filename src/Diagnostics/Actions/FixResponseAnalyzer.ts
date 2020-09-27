import isEqual = require("lodash.isequal");
import { CodeAction } from "./CodeAction";

/**
 * Provides the functionality to analyze a fix-response.
 */
export class FixResponseAnalyzer
{
    /**
     * The response to analyze.
     */
    private fixResponse: ts.server.protocol.GetCodeFixesResponse;

    /**
     * Initializes a new instance of the `FixResponseAnalyzer` class.
     *
     * @param fixResponse
     * The response to analyze.
     */
    public constructor(fixResponse: ts.server.protocol.GetCodeFixesResponse)
    {
        this.fixResponse = fixResponse;
    }

    /**
     * Gets the response to analyze.
     */
    public get FixResponse(): ts.server.protocol.GetCodeFixesResponse
    {
        return this.fixResponse;
    }

    /**
     * Gets the fixes.
     */
    public get Fixes(): CodeAction[]
    {
        return this.FixResponse.body.map((codeAction) => new CodeAction(codeAction));
    }

    /**
     * Filters the fixes with the specified name.
     *
     * @param fixName
     * The name of the fix to get.
     *
     * @returns
     * The fix-actions with the specified name.
     */
    public Filter(fixName: string): CodeAction[]
    {
        return this.Fixes.filter((codeAction) => codeAction.FixName === fixName);
    }

    /**
     * Gets a value indicating whether a combined fix with the specified id exists.
     *
     * @param fixId
     * The id of the combinded fix.
     *
     * @returns
     * A value indicating whether a combined fix is present.
     */
    public HasCombinedFix(fixId: unknown): boolean
    {
        return this.Fixes.some((codeAction) => isEqual(codeAction.FixID, fixId));
    }
}
