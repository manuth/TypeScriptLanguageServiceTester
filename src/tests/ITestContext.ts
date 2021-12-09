import { TSLintLanguageServiceTester } from "./TSLintLanguageServiceTester";

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
