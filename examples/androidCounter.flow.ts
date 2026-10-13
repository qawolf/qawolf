import { flow } from "@qawolf/flows/android";

export default flow(
  "android-counter",
  { target: "Android - Google Pixel 9 (Android 15 | Emulator)", launch: true },
  async ({ test, driver }) => {
    await test("app is launched", async () => {
      if (!driver) throw new Error("no driver after launch");
    });
  },
);
