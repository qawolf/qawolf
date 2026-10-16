---
"@qawolf/cli": patch
---

When a firewall in front of the QA Wolf API blocks a command's request with HTTP 403, the error no longer tells you to check your API key; it says the request was blocked before it reached the API.
