import { ElementEvent } from "@qawolf/types";
import { PatchBuilder } from "../../src/sync";
import { loadEvents } from "@qawolf/fixtures";
import { chunk } from "lodash";

describe("PatchBuilder.buildPatch", () => {
  let events: ElementEvent[];

  beforeAll(async () => {
    events = await loadEvents("scroll_login");
  });

  it("returns null when there are no steps to patch", () => {
    const builder = new PatchBuilder();
    expect(builder.buildPatch()).toBeNull();
  });

  it("builds a patch for non-included steps", () => {
    for (let isTest of [false, true]) {
      const builder = new PatchBuilder();

      // split the events in two chunks
      const chunkedEvents = chunk(events, (events.length + 1) / 2);
      for (let i = 0; i < chunkedEvents.length; i++) {
        chunkedEvents[i].forEach(event => builder.pushEvent(event));
        const { code, selectors, steps } = builder.buildPatch(isTest)!;

        expect({
          code,
          selectors: selectors.map(s => s.index)
        }).toMatchSnapshot(
          isTest ? `buildPatch_test${i}` : `buildPatch_script${i}`
        );

        expect(selectors.length).toEqual(steps.length);
        builder.commitSteps(steps.length);
      }
    }
  });
});
