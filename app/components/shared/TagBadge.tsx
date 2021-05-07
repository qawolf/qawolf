import { Box, Button } from "grommet";
import styled from "styled-components";

import { Tag as TagType } from "../../lib/types";
import { copy } from "../../theme/copy";
import {
  borderSize,
  colors,
  edgeSize,
  overflowStyle,
  transitionDuration,
} from "../../theme/theme";
import Close from "./icons/Close";
import Tag from "./icons/Tag";
import Text from "./Text";

type Props = {
  className?: string;
  onClick?: () => void;
  onClose?: () => void;
  tag?: TagType;
};

const maxWidth = "176px";

const StyledBox = styled(Box)`
  svg {
    transition: fill ${transitionDuration};
  }

  &:hover {
    svg {
      fill: ${colors.gray7};
    }
  }

  &:active {
    svg {
      fill: ${colors.gray9};
    }
  }
`;

function TagBadge({ className, onClick, onClose, tag }: Props): JSX.Element {
  const tagName = tag?.name || copy.noTags;

  const innerHtml = (
    <Box
      align="center"
      border={{ color: "gray3", size: borderSize.xsmall }}
      className={onClick ? className : undefined}
      direction="row"
      height={edgeSize.large}
      pad={{ horizontal: `calc(${edgeSize.xsmall} - ${borderSize.xsmall})` }}
      round="xlarge"
      style={{ maxWidth }}
    >
      <Box align="center" direction="row">
        {!!tag && <Tag color={tag.color} size={edgeSize.small} />}
        <Text
          color="gray7"
          margin={tag ? { left: "xxsmall" } : undefined}
          size="componentSmall"
          style={overflowStyle}
        >
          {tagName}
        </Text>
      </Box>
      {!!onClose && (
        <Button
          a11yTitle={`dismiss ${tagName}`}
          margin={{ left: "xxsmall" }}
          plain
          onClick={onClose}
        >
          <StyledBox>
            <Close color={colors.gray5} size={edgeSize.small} />
          </StyledBox>
        </Button>
      )}
    </Box>
  );

  if (!onClick) return innerHtml;

  return (
    <Button a11yTitle={`select ${tagName}`} plain onClick={onClick}>
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
