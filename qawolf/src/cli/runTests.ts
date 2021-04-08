import axios from "axios";
import { bold, red } from "kleur";

type RunTests = {
  env?: string;
  triggerId: string;
  wait: boolean;
};

const getApiKey = (): string => {
  const apiKey = process.env.QAWOLF_API_KEY;
  if (!apiKey) {
    console.log(red("Error: must set QAWOLF_API_KEY environment variable"));
    process.exit(1);
  }

  return apiKey;
};

export default async function runTests({
  env,
  triggerId,
  wait,
}: RunTests): Promise<void> {
  console.log(bold(`\n🐺  Run QA Wolf tests for trigger ${triggerId}`));

  console.log("VARIABLES", env, typeof env);
  console.log("TRIGGER", triggerId, "WAIT", wait);

  const apiKey = getApiKey();
  //   process.exit(1);
}
