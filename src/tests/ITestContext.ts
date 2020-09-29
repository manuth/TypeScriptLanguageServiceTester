import { ESLintLanguageServiceTester } from "./ESLintLanguageServiceTester";

/**
 * Provides a test-context.
 */
export interface ITestContext
{
    /**
     * A component for testing eslint-diagnostics.
     */
    ESLintTester: ESLintLanguageServiceTester;
}
