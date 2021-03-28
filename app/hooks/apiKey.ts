import { useContext } from "react";

import { StateContext } from "../components/StateContext";
import { TeamWithUsers } from "../lib/types";
import { copy } from "../theme/copy";
import { useTeam } from "./queries";

type UseApiKey = {
  apiKey: string;
  team: TeamWithUsers;
};

export const useApiKey = (): UseApiKey => {
  const { teamId } = useContext(StateContext);

  const { data } = useTeam({ id: teamId });
  const team = data?.team;

  const apiKey = team?.api_key || copy.apiKeyHere;

  return { apiKey, team };
};
