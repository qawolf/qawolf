import { Box, Button } from "grommet";
import styled from "styled-components";

import { ShortTrigger } from "../../lib/types";
import { copy } from "../../theme/copy";
import {
  borderSize,
  colors,
  edgeSize,
  transitionDuration,
} from "../../theme/theme-new";
import Text from "./Text";
import TriggerIcon from "./TriggerIcon";

type Props = {
  className?: string;
  isLoading?: boolean;
  onClick?: () => void;
  trigger: ShortTrigger | null;
};

function TriggerBadge({
  className,
  isLoading,
  onClick,
  trigger,
}: Props): JSX.Element {
  let label = copy.manuallyTriggered;
  if (trigger.name) label = trigger.name;
  else if (isLoading) label = copy.loading;

  const innerHtml = (
    <Box
      align="center"
      border={{ color: "gray3", size: borderSize.xsmall }}
      className={onClick ? className : undefined}
      direction="row"
      height={edgeSize.large}
      pad={{ horizontal: "xsmall" }}
      round="xlarge"
    >
      <TriggerIcon trigger={trigger} />
      <Text color="gray7" size="componentSmall">
        {label}
      </Text>
    </Box>
  );

  if (!onClick) return innerHtml;

  return (
    <Button a11yTitle={`filter ${name}`} plain onClick={onClick}>
      {innerHtml}
    </Button>
  );
}

const StyledTriggerBadge = styled(TriggerBadge)`
  transition: background ${transitionDuration};

  &:hover {
    background: ${colors.gray1};
  }

  &:active {
    background: ${colors.gray2};
  }
`;

export default StyledTriggerBadge;
