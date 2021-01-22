import { Blank, Checkmark, License, Logout, UserSettings } from "grommet-icons";
import { useRouter } from "next/router";

import { resetIntercom } from "../../../hooks/intercom";
import { JWT_KEY } from "../../../lib/client";
import { routes } from "../../../lib/routes";
import { updateSentryUser } from "../../../lib/sentry";
import { state } from "../../../lib/state";
import { ShortTeam } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import Dropdown from "../../shared/Dropdown";
import MenuButton from "./MenuButton";

type Props = {
  closeMenu: () => void;
  teamId: string;
  teams: ShortTeam[];
};

export default function TeamMenu({
  closeMenu,
  teamId,
  teams,
}: Props): JSX.Element {
  const { replace } = useRouter();

  const handleApiKeysClick = () => {
    state.setModal({ name: "apiKeys" });
    closeMenu();
  };

  const handleLogOutClick = () => {
    localStorage.removeItem(JWT_KEY);
    state.clear();
    resetIntercom();
    updateSentryUser(null);
    replace(routes.home);
  };

  const handleSettingsClick = () => {
    state.setModal({ name: "teamSettings", teamId });
    closeMenu();
  };

  const handleTeamClick = (teamId: string): void => {
    state.setTeamId(teamId);
  };

  const teamsHtml = teams.map((team) => {
    const isSelected = team.id === teamId;

    return (
      <MenuButton
        IconComponent={isSelected ? Checkmark : Blank}
        key={team.id}
        message={team.name}
        onClick={() => handleTeamClick(team.id)}
      />
    );
  });

  return (
    <Dropdown>
      {teamsHtml}
      <MenuButton
        IconComponent={UserSettings}
        hasBorder
        message={copy.teamSettings}
        onClick={handleSettingsClick}
      />
      <MenuButton
        IconComponent={License}
        message={copy.apiKeys}
        onClick={handleApiKeysClick}
      />
      <MenuButton
        IconComponent={Logout}
        message={copy.logOut}
        onClick={handleLogOutClick}
      />
    </Dropdown>
  );
}
