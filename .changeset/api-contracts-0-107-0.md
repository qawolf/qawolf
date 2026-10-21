---
"@qawolf/cli": minor
---

Upgrades `@qawolf/api-contracts` to `0.107.0`.

`qawolf issue create --type bug` takes `--file-paths` to attach the files a bug was reproduced with, and `qawolf issue attachFiles` adds files to a bug report that is already filed. QA Wolf keeps a copy of each file as it was when attached, so later changes to the original do not change the report.

This version also adds `qawolf build requestDownload`, and `qawolf run get` reports the app builds and site versions each run's attempts saw.
