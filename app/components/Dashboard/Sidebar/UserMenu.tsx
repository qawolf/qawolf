import { useContext } from "react";

import { state } from "../../../lib/state";
import Menu from "../../shared-new/Menu";
import Option from "../../shared-new/Select/Option";
import { StateContext } from "../../StateContext";
import { UserContext } from "../../UserContext";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function UserMenu({ isOpen, onClose }: Props): JSX.Element {
  const { teamId } = useContext(StateContext);
  const { user } = useContext(UserContext);

  if (!isOpen || !user) return null;

  const handleTeamClick = (teamId: string): void => {
    state.setTeamId(teamId);
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

  return <Menu direction="down">{optionsHtml}</Menu>;
}
