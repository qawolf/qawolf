import { CONFIG } from "@qawolf/config";
import { BrowserContext, launch, Page } from "../../src";
import { findElement } from "../../src/find/findElement";
import { getXpath } from "./utils";

describe("findHtml", () => {
  it("finds an element by a strong key (id)", async () => {
    const element = await findElement(
      page,
      { html: '<input id="another" >' },
      {
        timeoutMs: 0
      }
    );

    expect(await getXpath(element)).toEqual("//*[@id='another']");
  });

  it("finds html and body elements", async () => {
    // Use action "type" to make sure findElement skips
    // queryActionElements for body and html
    let element = await findElement(
      page,
      { html: "<body />" },
      {
        action: "type",
        timeoutMs: 0
      }
    );
    expect(await getXpath(element)).toEqual("/html/body");

    element = await findElement(
      page,
      { html: "<html />" },
      {
        action: "type",
        timeoutMs: 0
      }
    );
    expect(await getXpath(element)).toEqual("/html");
  });
});
