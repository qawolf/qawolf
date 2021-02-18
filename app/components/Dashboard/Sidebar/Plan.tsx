import { Box } from "grommet";

import { ShortTeam, Wolf as WolfType } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import { hoverTransition } from "../../../theme/theme";
import Text from "../../shared/Text";
import WolfSitting from "../../shared-new/icons/WolfSitting";
import styles from "./Sidebar.module.css";

type Props = {
  team: ShortTeam | null;
  wolf: WolfType;
};

export default function Plan({ team, wolf }: Props): JSX.Element {
  if (!team) return null;

  return (
    <Box flex={false}>
      <Box align="center" className={styles.userWolf} fill={false}>
        <Text
          color="black"
          margin={{ bottom: "small" }}
          size="medium"
          style={{ transition: hoverTransition }}
          weight="bold"
        >
          {copy.wolfIntro(wolf.name)}
        </Text>
        <WolfSitting color={wolf.variant} />
      </Box>
    </Box>
  );
}
