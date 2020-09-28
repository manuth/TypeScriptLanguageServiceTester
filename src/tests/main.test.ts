import { LanguageServiceTesterTests } from "./LanguageServiceTester.test";
import { TSServerTests } from "./TSServer.test";
import { WorkspaceTests } from "./Workspaces";

suite(
    "TypeScriptLanguageServiceTester",
    () =>
    {
        TSServerTests();
        LanguageServiceTesterTests();
        WorkspaceTests();
    });
