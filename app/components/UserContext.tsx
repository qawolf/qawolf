import { createContext, FC, useContext, useEffect } from "react";

import { useIdentifyPostHog } from "../hooks/postHog";
import { useCurrentUser } from "../hooks/queries";
import { state } from "../lib/state";
import { User, Wolf } from "../lib/types";
import { StateContext } from "./StateContext";

export type UserContextValue = {
  isLoggedIn: boolean;
  isUserLoading: boolean;
  user: User | null;
  wolf: Wolf | null;
};

export const UserContext = createContext<UserContextValue>({
  isLoggedIn: false,
  isUserLoading: true,
  user: null,
  wolf: null,
});

export const UserProvider: FC = ({ children }) => {
  const { teamId } = useContext(StateContext);
  const { data, loading } = useCurrentUser();

  const user = data?.currentUser || null;

  const isLoggedIn = !!(loading || user);

  const wolf = user
    ? {
        name: user.wolf_name,
        number: user.wolf_number,
        variant: user.wolf_variant,
      }
    : null;

  useEffect(() => {
    if (!user) return;

    const isValidTeamId =
      teamId && user.teams.some((team) => team.id === teamId);
    if (isValidTeamId) return;

    const fallbackTeamId = user.teams[0]?.id;
    if (!fallbackTeamId) return;

    // set team id if no valid team id
    state.setTeamId(fallbackTeamId);
  }, [teamId, user]);

  useIdentifyPostHog(user);

  const value = { isLoggedIn, isUserLoading: !user && loading, user, wolf };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
