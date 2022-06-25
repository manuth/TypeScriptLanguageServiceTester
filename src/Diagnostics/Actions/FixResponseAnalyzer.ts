import isEqual from "lodash.isequal";
import type { server } from "typescript/lib/tsserverlibrary.js";
import { CodeAction } from "./CodeAction.js";

/**
 * Provides the functionality to analyze a fix-response.
 */
export class FixResponseAnalyzer
{
    /**
     * The response to analyze.
     */
    private fixResponse: server.protocol.GetCodeFixesResponse;

    /**
     * Initializes a new instance of the {@link FixResponseAnalyzer `FixResponseAnalyzer`} class.
     *
     * @param fixResponse
     * The response to analyze.
     */
    public constructor(fixResponse: server.protocol.GetCodeFixesResponse)
    {
        this.fixResponse = fixResponse;
    }

    /**
     * Gets the response to analyze.
     */
    public get FixResponse(): server.protocol.GetCodeFixesResponse
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
     * Checks whether a fix with the specified {@link fixName `fixName`} exists.
     *
     * @param fixName
     * The name of the fix to look for.
     *
     * @returns
     * A value indicating whether a fix with the specified name exists.
     */
    public HasFix(fixName: string): boolean
    {
        return this.Fixes.some(
            (codeAction) => codeAction.FixName === fixName);
    }

    /**
     * Gets a value indicating whether a combined fix with the specified id exists.
     *
     * @param fixId
     * The id of the combined fix.
     *
     * @returns
     * A value indicating whether a combined fix is present.
     */
    public HasCombinedFix(fixId: unknown): boolean
    {
        return this.Fixes.some((codeAction) => isEqual(codeAction.FixID, fixId));
    }
}
