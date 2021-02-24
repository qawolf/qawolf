import { useRouter } from "next/router";
import { useContext } from "react";

import { resetIntercom } from "../../../hooks/intercom";
import { JWT_KEY } from "../../../lib/client";
import { routes } from "../../../lib/routes";
import { updateSentryUser } from "../../../lib/sentry";
import { state } from "../../../lib/state";
import { copy } from "../../../theme/copy";
import Divider from "../../shared-new/Divider";
import LogOut from "../../shared-new/icons/LogOut";
import Menu from "../../shared-new/Menu";
import Option from "../../shared-new/Select/Option";
import { StateContext } from "../../StateContext";
import { UserContext } from "../../UserContext";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function UserMenu({ isOpen, onClose }: Props): JSX.Element {
  const { replace } = useRouter();

  const { teamId } = useContext(StateContext);
  const { user } = useContext(UserContext);

  if (!isOpen || !user) return null;

  const handleLogOutClick = () => {
    localStorage.removeItem(JWT_KEY);
    state.clear();
    resetIntercom();
    updateSentryUser({ email: null });
    replace(routes.home);
  };

  const handleTeamClick = (teamId: string): void => {
    state.setTeamId(teamId);
    replace(routes.tests);
    onClose();
  };

  const optionsHtml = user.teams.map((team) => {
    return (
      <Option
        isSelected={team.id === teamId}
        key={team.id}
        label={team.name}
        onClick={() => handleTeamClick(team.id)}
      />
    );
  });

  return (
    <Menu direction="down">
      {optionsHtml}
      <Divider margin={{ vertical: "xxxsmall" }} />
      <Option
        IconComponent={LogOut}
        label={copy.logOut}
        onClick={handleLogOutClick}
      />
    </Menu>
  );
}
