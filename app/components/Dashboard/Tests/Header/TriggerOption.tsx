import { Box } from "grommet";

import { Trigger } from "../../../../lib/types";
import { overflowStyle } from "../../../../theme/theme-new";
import ColorDot from "../../../shared-new/ColorDot";
import Option from "../../../shared-new/Select/Option";
import Text from "../../../shared-new/Text";

type Props = {
  count: number;
  isSelected: boolean;
  label?: string;
  onClick: () => void;
  trigger?: Trigger;
};

const badgeHeight = "20px";

export default function TriggerOption({
  count,
  isSelected,
  label,
  onClick,
  trigger,
}: Props): JSX.Element {
  const labelHtml = (
    <Box align="center" direction="row" justify="between" width="full">
      <Box align="center" direction="row">
        {!!trigger && (
          <ColorDot color={trigger.color} margin={{ right: "xxsmall" }} />
        )}
        <Text color="gray9" size="component" style={overflowStyle}>
          {label || trigger?.name}
        </Text>
      </Box>
      <Box
        background="gray3"
        flex={false}
        height={badgeHeight}
        justify="center"
        pad={{ horizontal: "xxsmall" }}
        round="xlarge"
      >
        <Text color="gray9" size="componentSmall">
          {count}
        </Text>
      </Box>
    </Box>
  );

  return <Option isSelected={isSelected} label={labelHtml} onClick={onClick} />;
}
