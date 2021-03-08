import { Box } from "grommet";

import { RunStatus } from "../../lib/types";
import { copy } from "../../theme/copy";
import { getLabelForStatus } from "../Dashboard/helpers";
import StatusIcon from "./StatusIcon";
import Text from "./Text";
import { Size } from "./Text/config";

type Props = {
  count: number;
  size?: Size;
  status: RunStatus | null;
};

export default function StatusSummary({
  count,
  size,
  status,
}: Props): JSX.Element {
  const label = status ? `${count} ${getLabelForStatus(status)}` : copy.noRuns;

  return (
    <Box align="center" direction="row">
      {!!status && <StatusIcon status={status} />}
      <Text
        color="gray9"
        margin={status ? { left: "xxsmall" } : undefined}
        size={size || "componentBold"}
      >
        {label}
      </Text>
    </Box>
  );
}
