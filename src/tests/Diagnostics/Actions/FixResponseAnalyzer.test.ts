import { ok } from "node:assert";
import { Random } from "random-js";
import ts from "typescript/lib/tsserverlibrary.js";
import { CodeAction } from "../../../Diagnostics/Actions/CodeAction.js";
import { FixResponseAnalyzer } from "../../../Diagnostics/Actions/FixResponseAnalyzer.js";

/**
 * Registers tests for the {@linkcode FixResponseAnalyzer} class.
 */
export function FixResponseAnalyzerTests(): void
{
    suite(
        nameof(FixResponseAnalyzer),
        () =>
        {
            let random: Random;
            let fixes: Array<ts.server.protocol.CodeAction | ts.server.protocol.CodeFixAction>;
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
                        let fix: ts.server.protocol.CodeAction | ts.server.protocol.CodeFixAction;

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
                            command: ts.server.protocol.CommandTypes.GetCodeFixes,
                            body: fixes
                        });
                });

            suite(
                nameof<FixResponseAnalyzer>((analyzer) => analyzer.Fixes),
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
                nameof<FixResponseAnalyzer>((analyzer) => analyzer.HasFix),
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
                nameof<FixResponseAnalyzer>((analyzer => analyzer.HasCombinedFix)),
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
                        `Checking whether the existence of a combined fix can be determined correctly if the fix-id is an \`${nameof(Object)}\`…`,
                        () =>
                        {
                            let fixId = {
                                randomString: random.string(10)
                            };

                            let fix: ts.server.protocol.CodeFixAction = {
                                ...fixes[0],
                                fixName: random.string(10),
                                fixId
                            };

                            response.FixResponse.body ??= [];
                            response.FixResponse.body.push(fix);
                            ok(response.HasCombinedFix(fixId));
                        });
                });
        });
}
