import { Box } from "grommet";

import { RunStatus } from "../../../../server/types";
import { overflowStyle } from "../../../../theme/theme-new";
import CountBadge from "../../../shared-new/CountBadge";
import Option from "../../../shared-new/Select/Option";
import StatusIcon from "../../../shared-new/StatusIcon";
import Text from "../../../shared-new/Text";
import { getLabelForStatus } from "../../helpers";

type Props = {
  count: number;
  isSelected: boolean;
  onClick: () => void;
  status: RunStatus | null;
};

export default function StatusOption({
  count,
  isSelected,
  onClick,
  status,
}: Props): JSX.Element {
  const label = getLabelForStatus(status);

  const labelHtml = (
    <Box align="center" direction="row" justify="between" width="full">
      <Box align="center" direction="row">
        {!!status && <StatusIcon status={status} />}
        <Text
          color="gray9"
          margin={status ? { left: "xxsmall" } : undefined}
          size="component"
          style={overflowStyle}
        >
          {label}
        </Text>
      </Box>
      <CountBadge count={count} />
    </Box>
  );

  return <Option isSelected={isSelected} label={labelHtml} onClick={onClick} />;
}
