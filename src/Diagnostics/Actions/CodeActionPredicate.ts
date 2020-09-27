import { CodeAction } from "./CodeAction";

/**
 * Represents a component for filtering code-actions.
 */
export type CodeActionPredicate =
    /**
     * Filters the code-action.
     *
     * @param codeAction
     * The code-action to filter.
     *
     * @returns
     * A value indicating whether the code-action applies to the prediacate.
     */
    (codeAction: CodeAction) => boolean;
