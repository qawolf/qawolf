import { mkdtemp, outputFile, remove, readJSON } from "fs-extra";
import { snakeCase } from "lodash";
import { tmpdir } from "os";
import path from "path";
import puppeteer from "puppeteer";
import { buildTest } from "../build/buildTest";
import { logger } from "../logger";
import { runTest } from "../runTest";
import { Job } from "../types";

const saveTempTest = async (job: Job) => {
  const testData = buildTest(job);
  const testName = snakeCase(job.name);

  const tempRootDir = await mkdtemp(tmpdir());
  const testFolder = path.join(tempRootDir, ".qawolf/__tests__");

  const testFile = `${testFolder}${path.sep}${testName}.js`;
  await outputFile(testFile, testData, "utf8");
  logger.debug(`created test: ${testFile}`);

  return { testName, tempRootDir };
};

export const createRunTest = async (job: Job) => {
  const { testName, tempRootDir } = await saveTempTest(job);

  // keep the browser open so we can connect to it for assertions
  const saveBrowserWsPath = `${tempRootDir}/ws.json`;
  process.env.KEEP_BROWSER_OPEN = "true";
  process.env.SAVE_BROWSER_WS_PATH = saveBrowserWsPath;
  const success = await runTest(testName, tempRootDir);

  const json = await readJSON(saveBrowserWsPath);
  const browser = await puppeteer.connect({
    browserWSEndpoint: json.wsEndpoint
  });

  await remove(tempRootDir);

  return { browser, success };
};
