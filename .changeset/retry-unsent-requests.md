---
"@qawolf/cli": patch
---

When nothing was sent because the connection to the QA Wolf API never opened, the CLI now retries the request, including actions like `runner act`. It also gives up on opening a connection after 5 seconds instead of 10.
