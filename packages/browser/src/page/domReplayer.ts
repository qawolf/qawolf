import { logger } from "@qawolf/logger";
import { readFileSync, outputFile } from "fs-extra";
import { compile } from "handlebars";
import { resolve } from "path";
import { DecoratedPage } from "./Page";

const replayerTemplate = compile(
  readFileSync(resolve(__dirname, "../../static/replayer.hbs"), "utf8")
);

export const createDomReplayer = async (page: DecoratedPage, path: string) => {
  logger.debug(
    `Page: create dom replayer for ${page.qawolf.domEvents.length} events: ${path}`
  );
  if (!page.qawolf.domEvents.length) return;

  // cycle event loop to ensure we get all events
  try {
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 0)));
  } catch (e) {
    // ignore errors because the page could already be disposed
  }

  const replayer = replayerTemplate({
    eventsJson: JSON.stringify(page.qawolf.domEvents).replace(
      /<\/script>/g,
      "<\\/script>"
    ),
    url: page.url()
  });

  await outputFile(path, replayer);
};
