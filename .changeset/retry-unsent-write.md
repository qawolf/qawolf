---
"@qawolf/cli": patch
---

When a command that changes something, such as `runner act`, fails because its request could not be sent at all (a DNS failure, a refused connection, or a connect timeout on Node), it now says nothing was sent and the command is safe to run again, instead of warning that the action may have happened.
