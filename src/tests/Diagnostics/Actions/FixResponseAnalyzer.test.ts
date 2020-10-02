import { ok } from "assert";
import { Random } from "random-js";
import { server } from "typescript/lib/tsserverlibrary";
import { CodeAction } from "../../../Diagnostics/Actions/CodeAction";
import { FixResponseAnalyzer } from "../../../Diagnostics/Actions/FixResponseAnalyzer";

/**
 * Registers tests for the `FixResponseAnalyzer` class.
 */
export function FixResponseAnalyzerTests(): void
{
    suite(
        "FixResponseAnalyzer",
        () =>
        {
            let random: Random;
            let fixes: Array<server.protocol.CodeAction | server.protocol.CodeFixAction>;
            let response: FixResponseAnalyzer;

            suiteSetup(
                () =>
                {
                    random = new Random();
                });

            setup(
                function()
                {
                    this.timeout(5 * 1000);
                    fixes = [];

                    for (let i = random.integer(0, 10); i--; i > 0)
                    {
                        let fix: server.protocol.CodeAction | server.protocol.CodeFixAction;

                        fix = {
                            description: random.string(10),
                            changes: [],
                            commands: []
                        };

                        if (random.bool())
                        {
                            fix = {
                                ...fix,
                                fixName: random.string(10),
                                fixId: random.string(10),
                                fixAllDescription: random.string(10)
                            };
                        }

                        fixes.push(fix);
                    }

                    response = new FixResponseAnalyzer(
                        {
                            seq: 0,
                            type: "response",
                            success: true,
                            request_seq: 0,
                            command: server.protocol.CommandTypes.GetCodeFixes,
                            body: fixes
                        });
                });

            suite(
                "Fixes",
                () =>
                {
                    test(
                        "Checking whether all fixes are returned…",
                        () =>
                        {
                            ok(
                                fixes.every(
                                    (fix) =>
                                    {
                                        return response.Fixes.some(
                                            (otherFix) =>
                                            {
                                                return otherFix.CodeAction === fix;
                                            });
                                    }));
                        });
                });

            suite(
                "HasFix",
                () =>
                {
                    test(
                        "Checking whether the existence of a fix can be determined correctly…",
                        () =>
                        {
                            for (let fix of fixes)
                            {
                                if (CodeAction.IsCodeFixAction(fix))
                                {
                                    ok(response.HasFix(fix.fixName));
                                }
                            }

                            ok(!response.HasFix(random.string(11)));
                        });
                });

            suite(
                "HasCombinedFix",
                () =>
                {
                    test(
                        "Checking whether the existence of a combined fix can be determined correctly…",
                        () =>
                        {
                            for (let fix of fixes)
                            {
                                if (CodeAction.IsCodeFixAction(fix))
                                {
                                    ok(response.HasCombinedFix(fix.fixId));
                                }
                            }

                            ok(!response.HasCombinedFix(random.string(11)));
                        });

                    test(
                        "Checking whether the existenc of a combined fix can be determined correctly if the fix-id is an `object`…",
                        () =>
                        {
                            let fixId = {
                                randomString: random.string(10)
                            };

                            let fix: server.protocol.CodeFixAction = {
                                ...fixes[0],
                                fixName: random.string(10),
                                fixId
                            };

                            response.FixResponse.body.push(fix);
                            ok(response.HasCombinedFix(fixId));
                        });
                });
        });
}
