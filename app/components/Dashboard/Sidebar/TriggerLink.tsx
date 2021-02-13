import { Box } from "grommet";

import { Trigger } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import { hoverTransition, overflowStyle } from "../../../theme/theme";
import Text from "../../shared/Text";
import styles from "./Sidebar.module.css";

type Props = {
  isSelected: boolean;
  onClick: () => void;
  trigger: Trigger;
};

export default function TriggerLink({
  isSelected,
  onClick,
  trigger,
}: Props): JSX.Element {
  const background = isSelected ? "lightBlue" : "transparent";
  const color = isSelected ? "fadedBlue" : "black";

  // trigger name with space at end is indicated with &nbsp;
  const formattedName = trigger.name.replace(/&nbsp;/g, " ");

  return (
    <Box
      a11yTitle={trigger.name}
      align="center"
      background={background}
      className={styles.triggerLink}
      direction="row"
      flex={false}
      justify="between"
      margin={{ bottom: "medium" }}
      onClick={onClick}
      pad={{ left: "xxlarge", vertical: "small" }}
      round="small"
      style={{ transition: hoverTransition }}
    >
      <Text
        // use a placeholder message to prevent height from collapsing
        // if trigger name is an empty string
        color={formattedName ? color : "transparent"}
        size="medium"
        style={overflowStyle}
      >
        {formattedName || copy.woof}
      </Text>
    </Box>
  );
}
