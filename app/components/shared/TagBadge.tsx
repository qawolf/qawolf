import { Box, Button } from "grommet";
import styled from "styled-components";

import { Tag as TagType } from "../../lib/types";
import {
  borderSize,
  colors,
  edgeSize,
  transitionDuration,
} from "../../theme/theme";
import Tag from "./icons/Tag";
import Text from "./Text";

type Props = {
  className?: string;
  onClick?: () => void;
  tag: TagType;
};

function TagBadge({ className, onClick, tag }: Props): JSX.Element {
  // TODO: include max width
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
      <Tag color={tag.color} size={edgeSize.small} />
      <Text color="gray7" margin={{ left: "xxsmall" }} size="componentSmall">
        {tag.name}
      </Text>
    </Box>
  );

  if (!onClick) return innerHtml;

  return (
    <Button a11yTitle={`filter ${tag.name}`} plain onClick={onClick}>
      {innerHtml}
    </Button>
  );
}

const StyledTagBadge = styled(TagBadge)`
  transition: background ${transitionDuration};

  &:hover {
    background: ${colors.gray1};
  }

  &:active {
    background: ${colors.gray2};
  }
`;

export default StyledTagBadge;
