import { useContext } from "react";

import { useEnvironmentVariables } from "../../../hooks/queries";
import { Env } from "../../../lib/types";
import { StateContext } from "../../StateContext";

export type EnvHook = {
  env: Env | null;
};

export const useEnv = (): EnvHook => {
  const { groupId } = useContext(StateContext);

  const { data } = useEnvironmentVariables({ group_id: groupId || "" });

  const envString = data?.environmentVariables.env;
  const env = envString ? JSON.parse(envString) : null;

  return { env };
};
