import { Box, Button } from "grommet";
import { useState } from "react";
import styled from "styled-components";
import {
  borderSize,
  colors,
  edgeSize,
  transitionDuration,
} from "../../../theme/theme-new";

import Text from "../Text";
import Selector from "../icons/Selector";

type Props = {
  className?: string;
  isOpen: boolean;
};

const width = "160px";

function Chooser({ className }: Props): JSX.Element {
  return (
    <Box
      align="center"
      border={{ color: "gray3", size: borderSize.xsmall }}
      className={className}
      direction="row"
      height={edgeSize.large}
      justify="between"
      pad={{ horizontal: "xsmall" }}
      round={borderSize.small}
      width={width}
    >
      <Text color="gray0" size="component">
        Select
      </Text>
      <Selector color="gray0" size={edgeSize.small} />
    </Box>
  );
}

const StyledChooser = styled(Chooser)`
  transition: border-color ${transitionDuration};

  ${(props) => props.isOpen && `border-color: ${colors.gray7};`}

  &:hover {
    border-color: ${colors.gray5};
  }
`;

export default StyledChooser;
