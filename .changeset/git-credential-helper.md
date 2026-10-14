---
"@qawolf/cli": minor
---

`qawolf auth login` now sets up Git to use your QA Wolf sign-in, so `git clone`, `git fetch` and `git push` work with a workspace's QA Wolf Git URL and do not ask for a password. Login adds an empty `credential.<host>.helper` entry and then the CLI entry to your global Git config, so Git asks only the CLI for the QA Wolf host. Login prints the file and the lines it added, and changes no other Git setting. `qawolf auth logout` removes those entries. Git setup is skipped when the CLI runs through `npx` or `bunx`.
