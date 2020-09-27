import { Diagnostic } from "./Diagnostic";

/**
 * Represents a component for filtering diagnostics.
 */
export type DiagnosticPredicate =
    /**
     * Filters the diagnostic.
     *
     * @param diagnostic
     * The diagnostic to filter.
     *
     * @returns
     * A value indicating whether the diagnostic applies to the prediacate.
     */
    (diagnostic: Diagnostic) => boolean;
