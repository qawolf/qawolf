import { CONFIG } from "@qawolf/config";
import { ElementEvent } from "@qawolf/types";
import { QAWolfWeb } from "@qawolf/web";
import { launch, LaunchResult } from "../../src/launch";
import { PageManager } from "../../src/managers/PageManager";

describe("PageManager", () => {
  let launched: LaunchResult;
  let manager: PageManager;

  beforeAll(async () => {
    launched = await launch();

    const page = await launched.context.newPage();
    manager = await PageManager.create({ index: 0, page });
  });

  afterAll(() => launched.browser.close());

  it("disposes when the page is closed", async () => {
    const page = await launched.context.newPage();
    const manager = await PageManager.create({ index: 1, page });
    expect(manager._disposed).toBe(false);
    await manager.page().close();
    expect(manager._disposed).toBe(true);
  });

  it("emits recorded events", async () => {
    await manager.recordEvents();

    let events: ElementEvent[] = [];
    manager.on("recorded_event", event => events.push(event));

    await manager.page().goto(CONFIG.sandboxUrl);
    await manager.page().click('css=[href="/buttons"');

    expect(events.map(e => e.name)).toEqual(["mousedown", "click"]);
  });

  it("injects qawolf", async () => {
    const qawolfExists = await manager.page().evaluate(() => {
      const qawolf: QAWolfWeb = (window as any).qawolf;
      return !!qawolf;
    });
    expect(qawolfExists).toBe(true);
  });
});
