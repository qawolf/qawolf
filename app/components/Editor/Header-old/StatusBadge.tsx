import { Box } from "grommet";

import { getBackgroundForStatus } from "../../../lib/colors";
import { RunStatus } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import Text from "../../shared/Text";
import styles from "./Header.module.css";

type Props = {
  status?: RunStatus | null;
};

export default function StatusBadge({ status }: Props): JSX.Element {
  if (!status) return null;

  const { background, borderColor } = getBackgroundForStatus(status);

  let className = undefined;
  let message = copy.testInProgress;

  if (status === "fail") {
    className = styles.statusBadgeFail;
    message = copy.testFail;
  }
  if (status === "pass") {
    className = styles.statusBadgePass;
    message = copy.testPass;
  }

  return (
    <Box
      justify="center"
      background={borderColor}
      className={className}
      margin={{ left: "medium" }}
      pad={{ horizontal: "medium", vertical: "small" }}
      round="small"
    >
      <Text color={background} size="medium" weight="bold">
        {message}
      </Text>
    </Box>
  );
}
