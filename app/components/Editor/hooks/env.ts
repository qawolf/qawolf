import { useContext } from "react";

import { useEnvironmentVariables } from "../../../hooks/queries";
import { Env } from "../../../lib/types";
import { StateContext } from "../../StateContext";

export type EnvHook = { env: Env };

type UseEnv = {
  apiKey: string;
  inbox: string;
  suiteVariables?: string | null;
};

export const useEnv = ({ apiKey, inbox, suiteVariables }: UseEnv): EnvHook => {
  const { environmentId } = useContext(StateContext);

  const { data } = useEnvironmentVariables({
    environment_id: environmentId || "",
  });

  const env = JSON.parse(data?.environmentVariables.env || "{}");
  const suiteEnv = JSON.parse(suiteVariables || "{}");

  return {
    env: {
      ...env,
      ...suiteEnv,
      QAWOLF_TEAM_API_KEY: apiKey,
      QAWOLF_TEAM_INBOX: inbox,
    },
  };
};
