import { Box } from "grommet";

import { Team, Wolf as WolfType } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import { hoverTransition } from "../../../theme/theme";
import Wolf from "../../shared/icons/Wolf";
import Text from "../../shared/Text";
import styles from "./Sidebar.module.css";

type Props = {
  team: Team | null;
  wolf: WolfType;
};

const getWolfMargin = (variant: string): string => {
  if (variant === "gray" || variant === "white") return "-2px";
  if (variant === "blue") return "2px";
  if (variant === "husky") return "1px";
  return "-1px";
};

export default function Plan({ team, wolf }: Props): JSX.Element {
  if (!team) return null;

  const bottomMargin = getWolfMargin(wolf.variant);

  return (
    <Box flex={false}>
      <Box
        align="center"
        className={styles.userWolf}
        fill={false}
        margin={{ bottom: bottomMargin }}
      >
        <Text
          color="black"
          margin={{ bottom: "small" }}
          size="medium"
          style={{ transition: hoverTransition }}
          weight="bold"
        >
          {copy.wolfIntro(wolf.name)}
        </Text>
        <Wolf wolf={wolf} />
      </Box>
    </Box>
  );
}
