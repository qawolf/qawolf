import { logger } from "@qawolf/logger";
import { readFileSync, outputFile } from "fs-extra";
import { compile } from "handlebars";
import { resolve } from "path";
import { Page } from "./Page";

const replayerTemplate = compile(
  readFileSync(resolve(__dirname, "../../static/replayer.hbs"), "utf8")
);

export const createDomReplayer = async (page: Page, path: string) => {
  logger.debug(
    `Page: create dom replayer for ${page.domEvents.length} events: ${path}`
  );
  if (!page.domEvents.length) return;

  // cycle event loop to ensure we get all events
  try {
    await page.super.evaluate(
      () => new Promise(resolve => setTimeout(resolve, 0))
    );
  } catch (e) {
    // ignore errors because the page could already be disposed
  }

  const replayer = replayerTemplate({
    eventsJson: JSON.stringify(page.domEvents).replace(
      /<\/script>/g,
      "<\\/script>"
    ),
    url: page.super.url()
  });

  await outputFile(path, replayer);
};
