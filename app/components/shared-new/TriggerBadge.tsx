import { Box, Button } from "grommet";
import styled from "styled-components";

import { copy } from "../../theme/copy";
import { borderSize, colors, transitionDuration } from "../../theme/theme-new";
import ColorDot from "./ColorDot";
import Text from "./Text";

type Props = {
  className?: string;
  color?: string | null;
  isLoading?: boolean;
  name?: string | null;
  onClick?: () => void;
};

function TriggerBadge({
  color,
  className,
  isLoading,
  name,
  onClick,
}: Props): JSX.Element {
  if (!isLoading && !name) return null;

  const innerHtml = (
    <Box
      align="center"
      border={{ color: "gray3", size: borderSize.xsmall }}
      className={onClick ? className : undefined}
      direction="row"
      pad={{ horizontal: "xsmall", vertical: "xxxsmall" }}
      round="xlarge"
    >
      {!!color && <ColorDot color={color} margin={{ right: "xxsmall" }} />}
      <Text color="gray9" size="component">
        {name || copy.loading}
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
