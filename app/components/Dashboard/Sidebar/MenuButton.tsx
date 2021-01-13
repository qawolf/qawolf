import { Box, Button } from "grommet";
import { Icon } from "grommet-icons";

import { hoverTransition, iconSize } from "../../../theme/theme";
import Text from "../../shared/Text";
import styles from "./Sidebar.module.css";

type Props = {
  IconComponent: Icon;
  hasBorder?: boolean;
  message: string;
  onClick: () => void;
};

export default function MenuButton({
  IconComponent,
  hasBorder,
  message,
  onClick,
}: Props): JSX.Element {
  const border = hasBorder
    ? { color: "borderGray", side: "top" as const }
    : undefined;

  return (
    <Button onClick={onClick} plain>
      <Box
        align="center"
        border={border}
        className={styles.teamButton}
        direction="row"
        pad={{ horizontal: "medium", vertical: "small" }}
        style={{ transition: hoverTransition }}
      >
        <IconComponent color="black" size={iconSize} />
        <Text color="black" margin={{ left: "small" }} size="medium">
          {message}
        </Text>
      </Box>
    </Button>
  );
}
