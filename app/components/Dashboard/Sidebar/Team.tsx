import { Box, Button } from "grommet";
import { useRef, useState } from "react";

import { Team as TeamType, User } from "../../../lib/types";
import { hoverTransition } from "../../../theme/theme";
import Avatar from "../../shared/Avatar";
import Drop from "../../shared/Drop";
import Text from "../../shared/Text";
import styles from "./Sidebar.module.css";
import TeamMenu from "./TeamMenu";

type Props = {
  selectedTeam: TeamType | null;
  user: User;
};

export default function Team({ selectedTeam, user }: Props): JSX.Element {
  const ref = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen((prev) => !prev);
  };

  const handleClickOutside = (e: React.MouseEvent<HTMLDocument>) => {
    // ignore clicks on the avatar
    if (ref.current.contains(e.target as HTMLButtonElement)) return;
    setIsOpen(false);
  };

  const formattedName = selectedTeam?.name.replace(/&nbsp;/g, " ");

  return (
    <Box>
      <Button a11yTitle="team settings" onClick={handleClick} plain ref={ref}>
        <Box
          align="center"
          className={styles.teamButton}
          direction="row"
          pad={{ vertical: "small" }}
          round="small"
          style={{ transition: hoverTransition }}
        >
          <Avatar avatarUrl={user.avatar_url} wolfVariant={user.wolf_variant} />
          <Text
            color="black"
            margin={{ left: "medium" }}
            size="large"
            weight="bold"
          >
            {formattedName || ""}
          </Text>
        </Box>
      </Button>
      {isOpen && !!selectedTeam && (
        <Drop
          align={{ left: "left", top: "bottom" }}
          onClickOutside={handleClickOutside}
          onEsc={() => setIsOpen(false)}
          target={ref.current}
        >
          <TeamMenu
            closeMenu={() => setIsOpen(false)}
            teamId={selectedTeam.id}
            teams={user.teams}
          />
        </Drop>
      )}
    </Box>
  );
}
