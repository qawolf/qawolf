import { Box, Button } from "grommet";
import { Previous } from "grommet-icons";
import { useRouter } from "next/router";
import { useContext } from "react";

import { routes } from "../../../lib/routes";
import { Wolf } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import { edgeSize, hoverTransition, iconSize } from "../../../theme/theme";
import Text from "../../shared/Text";
import { StateContext } from "../../StateContext";
import { RunnerContext } from "../contexts/RunnerContext";
import Collaborators from "./Collaborators";
import styles from "./Header.module.css";
import StatusBadge from "./StatusBadge";
import WolfBadge from "./WolfBadge";

type Props = {
  hideWolf: boolean;
  isMobile: boolean;
  wolf: Wolf | null;
};

// icon size + icon padding + badge size - badge size / 2 is center of wolf
// - half of text width to center it
const LEFT = `calc(${iconSize} + ${edgeSize.medium} + ${edgeSize.xxlarge} - (${edgeSize.xxlarge} / 2) - (120.48px / 2))`;

export default function TestStatus({
  hideWolf,
  isMobile,
  wolf,
}: Props): JSX.Element {
  const { progress } = useContext(RunnerContext);
  const { dashboardUri } = useContext(StateContext);

  const { push } = useRouter();

  const handleClick = () => push(dashboardUri || routes.tests);

  return (
    <Box align="center" direction="row">
      <Box className={styles.backButton} style={{ position: "relative" }}>
        <Button data-test="test-back" onClick={handleClick} plain>
          <Box align="center" direction="row">
            <Box margin={{ right: "medium" }}>
              <Previous color="black" size={iconSize} />
            </Box>
            <WolfBadge
              hideWolf={hideWolf}
              status={progress?.status}
              wolf={wolf}
            />
          </Box>
        </Button>
        <Text
          as="p"
          color="black"
          size="small"
          style={{
            left: LEFT,
            position: "absolute",
            top: `calc(-${edgeSize.medium} - ${edgeSize.small})`,
            transition: hoverTransition,
            whiteSpace: "nowrap",
          }}
        >
          {copy.back}
        </Text>
      </Box>
      <Collaborators />
      {!isMobile && <StatusBadge status={progress?.status} />}
    </Box>
  );
}
