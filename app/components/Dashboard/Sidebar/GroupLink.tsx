import { Box } from "grommet";
import { useState } from "react";

import { Group } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import { hoverTransition, overflowStyle } from "../../../theme/theme";
import Text from "../../shared/Text";
import GroupMenuButton from "./GroupMenuButton";
import styles from "./Sidebar.module.css";

type Props = {
  group: Group;
  isSelected: boolean;
  onClick: () => void;
};

export default function GroupLink({
  group,
  isSelected,
  onClick,
}: Props): JSX.Element {
  const [showMenuButton, setShowMenuButton] = useState(false);

  const background = isSelected ? "lightBlue" : "transparent";
  const color = isSelected ? "fadedBlue" : "black";

  // group name with space at end is indicated with &nbsp;
  const formattedName = group.name.replace(/&nbsp;/g, " ");

  const handleMouseEnter = () => {
    if (group.is_default) return;
    setShowMenuButton(true);
  };

  return (
    <Box
      a11yTitle={group.name}
      align="center"
      background={background}
      className={styles.groupLink}
      direction="row"
      flex={false}
      justify="between"
      margin={{ bottom: "medium" }}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShowMenuButton(false)}
      pad={{ left: "xxlarge", vertical: "small" }}
      round="small"
      style={{ transition: hoverTransition }}
    >
      <Text
        // use a placeholder message to prevent height from collapsing
        // if group name is an empty string
        color={formattedName ? color : "transparent"}
        size="medium"
        style={overflowStyle}
      >
        {formattedName || copy.woof}
      </Text>
      <GroupMenuButton group={group} isVisible={showMenuButton} />
    </Box>
  );
}
