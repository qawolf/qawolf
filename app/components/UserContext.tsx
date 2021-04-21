import { createContext, FC, useContext, useEffect } from "react";

import { updateIntercomUser } from "../hooks/intercom";
import { useCurrentUser, useTeam } from "../hooks/queries";
import { identifySegmentUser, useSegmentPage } from "../hooks/segment";
import { state } from "../lib/state";
import { Team, User, Wolf } from "../lib/types";
import { StateContext } from "./StateContext";

export type UserContextValue = {
  isLoggedIn: boolean;
  isUserLoading: boolean;
  team: Team | null;
  user: User | null;
  wolf: Wolf | null;
};

export const UserContext = createContext<UserContextValue>({
  isLoggedIn: false,
  isUserLoading: true,
  team: null,
  user: null,
  wolf: null,
});

export const UserProvider: FC = ({ children }) => {
  const { teamId } = useContext(StateContext);

  const { data: teamData } = useTeam({ id: teamId });
  const { data: userData, loading } = useCurrentUser();

  const team = teamData?.team || null;
  const user = userData?.currentUser || null;

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

  useEffect(() => {
    if (!user) return;

    identifySegmentUser(user);
    updateIntercomUser(user);
  }, [user]);

  useEffect(() => {
    if (team && !team.git_sync_integration_id) {
      state.setBranch(null); // ensure no branch selected
    }
  }, [team]);

  useSegmentPage();

  const value = {
    isLoggedIn,
    isUserLoading: !user && loading,
    team,
    user,
    wolf,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
