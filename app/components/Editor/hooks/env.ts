import { useContext } from "react";

import { useEnvironmentVariables } from "../../../hooks/queries";
import { Env } from "../../../lib/types";
import { StateContext } from "../../StateContext";

export type EnvHook = { env: Env | null };

export const useEnv = (suiteVariables?: string | null): EnvHook => {
  const { environmentId } = useContext(StateContext);

  const { data } = useEnvironmentVariables({
    environment_id: environmentId || "",
  });

  const env = JSON.parse(data?.environmentVariables.env || "{}");
  const suiteEnv = JSON.parse(suiteVariables || "{}");

  const combinedEnv = { ...env, ...suiteEnv };

  if (Object.keys(combinedEnv).length) return { env: combinedEnv };

  return null;
};
