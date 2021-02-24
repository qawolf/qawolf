import { Box } from "grommet";

import { RunStatus } from "../../../../server/types";
import { copy } from "../../../../theme/copy";
import StatusIcon from "../../../shared-new/StatusIcon";
import Text from "../../../shared-new/Text";
import { getLabelForStatus } from "../../helpers";

type Props = {
  count: number;
  status: RunStatus | null;
};

const textProps = {
  color: "gray9",
  size: "componentBold" as const,
};

export default function StatusSummary({ count, status }: Props): JSX.Element {
  const label = status ? `${count} ${getLabelForStatus(status)}` : copy.noRuns;

  return (
    <Box align="center" direction="row">
      {!!status && <StatusIcon status={status} />}
      <Text {...textProps} margin={status ? { left: "xxsmall" } : undefined}>
        {label}
      </Text>
    </Box>
  );
}
