import { Box, Button } from "grommet";

import { copy } from "../../theme/copy";
import { borderSize, edgeSize } from "../../theme/theme-new";
import ColorDot from "./ColorDot";
import Text from "./Text";

type Props = {
  color?: string | null;
  isLoading?: boolean;
  name?: string | null;
  onClick?: () => void;
};

export default function TriggerBadge({
  color,
  isLoading,
  name,
  onClick,
}: Props): JSX.Element {
  if (!isLoading && !name) return null;

  const innerHtml = (
    <Box
      align="center"
      border={{ color: "gray3", size: borderSize.xsmall }}
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
