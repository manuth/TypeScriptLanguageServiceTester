import Assert = require("assert");
import { Random } from "random-js";
import { server } from "typescript/lib/tsserverlibrary";
import { CodeAction } from "../../../Diagnostics/Actions/CodeAction";

/**
 * Registers tests for the `CodeAction` test.
 */
export function CodeActionTests(): void
{
    suite(
        "CodeAction",
        () =>
        {
            let random: Random;
            let codeAction: server.protocol.CodeAction;
            let codeFixAction: server.protocol.CodeFixAction;
            let codeActionWrapper: CodeAction;
            let codeFixActionWrapper: CodeAction;

            suiteSetup(
                async () =>
                {
                    random = new Random();
                });

            setup(
                async () =>
                {
                    codeAction = {
                        description: random.string(10),
                        changes: [],
                        commands: []
                    };

                    codeFixAction = {
                        ...codeAction,
                        fixName: random.string(10),
                        fixId: random.string(10),
                        fixAllDescription: random.string(10)
                    };

                    codeActionWrapper = new CodeAction(codeAction);
                    codeFixActionWrapper = new CodeAction(codeFixAction);
                });

            suite(
                "CodeAction",
                () =>
                {
                    test(
                        "Checking whether the origin of the code-action can be determined…",
                        () =>
                        {
                            Assert.strictEqual(codeAction, codeActionWrapper.CodeAction);
                            Assert.strictEqual(codeFixAction, codeFixActionWrapper.CodeAction);
                        });
                });

            suite(
                "IsCodeFixAction",
                () =>
                {
                    test(
                        "Checking whether the type of code-fixes can be determined correctly…",
                        () =>
                        {
                            Assert.ok(!CodeAction.IsCodeFixAction(codeAction));
                            Assert.ok(CodeAction.IsCodeFixAction(codeFixAction));
                        });
                });
        });
}
