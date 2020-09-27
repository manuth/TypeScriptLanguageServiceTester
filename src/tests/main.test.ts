import { LanguageServiceTesterTests } from "./LanguageServiceTester.test";
import { TSServerTests } from "./TSServer.test";

suite(
    "TypeScriptLanguageServiceTester",
    () =>
    {
        TSServerTests();
        LanguageServiceTesterTests();
    });
