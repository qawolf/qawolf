---
"@qawolf/cli": major
---

Breaking: the CLI requires Node 24.14.1 or newer (it was 20.19.0). Pin `@qawolf/flow-targets` 2.0.0 and `@qawolf/flows` 0.3.0. Local runs now accept the renamed execution targets, for example `Android - Google Pixel 9 (Android 16 | Emulator)`, `Android - Any Phone (Latest | Emulator)` and `iOS - Any iPhone (Latest)`. The old names keep working, and `qawolf init` writes `@qawolf/flows` 0.3.0. `Any Phone` and `Any Tablet` targets run on the `pixel_9` and `pixel_tablet` AVDs. Physical-phone targets (`Android - Samsung Galaxy A17/A37 (Android 16)`) are skipped with a warning, like iOS targets. API 37 targets install the `android-37.0` system image.
