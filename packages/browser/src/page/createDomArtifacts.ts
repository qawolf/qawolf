import { CONFIG } from "@qawolf/config";
import { logger } from "@qawolf/logger";
import { readFileSync, outputFile } from "fs-extra";
import { compile } from "handlebars";
import { join, resolve } from "path";
import { Page } from "./Page";

const replayerTemplate = compile(
  readFileSync(resolve(__dirname, "../../static/replayer.hbs"), "utf8")
);

export const createDomReplayer = async (page: Page, path: string) => {
  logger.debug(
    `createDomReplayer: save to ${path} for ${page.qawolf.domEvents.length} events`
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

export const createDomArtifacts = async (pages: Page[], date: Number) => {
  if (!CONFIG.artifactPath) return;

  await Promise.all(
    pages.map((page, index) =>
      createDomReplayer(
        page,
        join(CONFIG.artifactPath!, `page_${index}__${date}.html`)
      )
    )
  );
};
