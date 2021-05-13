import retry from "async-retry";
import axios from "axios";
import { bold, green, red } from "kleur";

type CreateSuite = {
  branch?: string;
  environment?: string;
  tags?: string;
  triggerId?: string;
  variables?: string;
};

type RunTests = CreateSuite & {
  wait: boolean;
};

type Status = "fail" | "pass";

const qaWolfUrl = process.env.QAWOLF_URL || "https://www.qawolf.com";

const createSuite = async ({
  branch,
  environment,
  tags,
  triggerId,
  variables,
}: CreateSuite): Promise<{ id: string; url: string }> => {
  const suitesUrl = new URL("/api/suites", qaWolfUrl).href;

  try {
    const {
      data: { id, url },
    } = await axios.post(
      suitesUrl,
      {
        branch: branch || null,
        environment,
        tags,
        trigger_id: triggerId,
        variables,
      },
      { headers: { authorization: process.env.QAWOLF_API_KEY } }
    );

    console.log("Created suite, see details at", url);

    return { id, url };
  } catch (error) {
    console.log(red(`Error creating suite: ${error.response?.data}`));
    process.exit(1);
  }
};

const ensureApiKey = (): void => {
  if (!process.env.QAWOLF_API_KEY) {
    console.log(red("Error: must set QAWOLF_API_KEY environment variable"));

    process.exit(1);
  }
};

const waitForSuite = async (suiteId: string): Promise<Status> => {
  console.log("Waiting for tests to run...");

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
      reject(new Error("Suite not complete"));
    }, timeoutMs);
  });

  return Promise.race([requestPromise, timeoutPromise]);
};

export default async function runTests({
  branch,
  environment,
  tags,
  triggerId,
  variables,
  wait,
}: RunTests): Promise<void> {
  const tagsMessage = tags ? ` for tags ${tags}` : "";
  console.log(bold(`\n🐺 Run QA Wolf tests${tagsMessage}`));

  ensureApiKey();
  const { id: suiteId, url } = await createSuite({
    branch,
    environment,
    tags,
    triggerId,
    variables,
  });

  if (!wait) return;

  const status = await waitForSuite(suiteId);

  const colorFn = status === "fail" ? red : green;
  console.log(colorFn(`🐺 Complete, suite ${status}ed: ${url}`));

  process.exit(status === "fail" ? 1 : 0);
}
