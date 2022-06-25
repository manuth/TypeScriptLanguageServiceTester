import { TSLintLanguageServiceTester } from "./TSLintLanguageServiceTester.js";

/**
 * Provides a test-context.
 */
export interface ITestContext
{
    /**
     * A component for testing tslint-diagnostics.
     */
    TSLintTester: TSLintLanguageServiceTester;
}
