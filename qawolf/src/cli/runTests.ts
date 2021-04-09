import retry from "async-retry";
import axios from "axios";
import { bold, green, red } from "kleur";

type CreateSuite = {
  env?: string;
  triggerId: string;
};

type RunTests = CreateSuite & { wait: boolean };

type Status = "fail" | "pass";

const qaWolfUrl = process.env.QAWOLF_URL || "https://www.qawolf.com";

const createSuite = async ({
  env,
  triggerId,
}: CreateSuite): Promise<string> => {
  const suitesUrl = new URL("/api/suites", qaWolfUrl).href;

  const {
    data: { id, url },
  } = await axios.post(
    suitesUrl,
    { env, trigger_id: triggerId },
    { headers: { authorization: process.env.QAWOLF_API_KEY } }
  );

  console.log("Created suite, see details at", url);

  return id;
};

const ensureApiKey = (): void => {
  if (!process.env.QAWOLF_API_KEY) {
    console.log(red("Error: must set QAWOLF_API_KEY environment variable"));

    process.exit(1);
  }
};

const waitForSuite = async (suiteId: string): Promise<Status> => {
  console.log("waiting for tests to run...");

  const suiteUrl = new URL(`/api/suites/${suiteId}`, qaWolfUrl).href;

  const intervalMs = 10 * 1000; // 10 seconds
  const timeoutMs = 30 * 60 * 1000; // 30 minutes
  let timeout = false;

  const requestPromise = retry(
    async () => {
      if (timeout) return;

      const { data } = await axios.get(suiteUrl, {
        headers: { authorization: process.env.QAWOLF_API_KEY },
      });

      if (!data.is_complete) throw new Error("suite not complete");

      return data.status;
    },
    {
      factor: 1,
      maxTimeout: intervalMs,
      minTimeout: intervalMs,
      retries: Math.round(timeoutMs / intervalMs),
    }
  );

  const timeoutPromise = new Promise<Status>((_, reject) => {
    setTimeout(() => {
      timeout = true;
      reject(new Error("suite not complete"));
    }, timeoutMs);
  });

  return Promise.race([requestPromise, timeoutPromise]);
};

export default async function runTests({
  env,
  triggerId,
  wait,
}: RunTests): Promise<void> {
  console.log(bold(`\n🐺  Run QA Wolf tests for trigger ${triggerId}`));

  ensureApiKey();
  const suiteId = await createSuite({ env, triggerId });

  if (!wait) return;

  const status = await waitForSuite(suiteId);

  const colorFn = status === "fail" ? red : green;
  console.log(colorFn(`🐺 complete, suite ${status}ed`));

  if (status === "pass") return;

  process.exit(1);
}
