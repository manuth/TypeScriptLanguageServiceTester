import { ok, strictEqual } from "assert";
import { Random } from "random-js";
import { server } from "typescript/lib/tsserverlibrary.js";
import { CodeAction } from "../../../Diagnostics/Actions/CodeAction.js";

/**
 * Registers tests for the {@link CodeAction `CodeAction`} test.
 */
export function CodeActionTests(): void
{
    suite(
        nameof(CodeAction),
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
                nameof(nameof<CodeAction>((action) => action.CodeAction)),
                () =>
                {
                    test(
                        "Checking whether the origin of the code-action can be determined…",
                        () =>
                        {
                            strictEqual(codeAction, codeActionWrapper.CodeAction);
                            strictEqual(codeFixAction, codeFixActionWrapper.CodeAction);
                        });
                });

            suite(
                nameof(CodeAction.IsCodeFixAction),
                () =>
                {
                    test(
                        "Checking whether the type of code-fixes can be determined correctly…",
                        () =>
                        {
                            ok(!CodeAction.IsCodeFixAction(codeAction));
                            ok(CodeAction.IsCodeFixAction(codeFixAction));
                        });
                });
        });
}
