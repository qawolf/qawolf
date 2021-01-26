import { Box } from "grommet";
import styled from "styled-components";

import {
  borderSize,
  colors,
  edgeSize,
  overflowStyle,
  transitionDuration,
} from "../../../theme/theme-new";
import Selector from "../icons/Selector";
import Text from "../Text";

type Props = {
  className?: string;
  isOpen: boolean;
  label: string;
};

export const height = edgeSize.large;
const width = "180px";

function Chooser({ className, label }: Props): JSX.Element {
  return (
    <Box
      align="center"
      border={{ color: "gray8", size: borderSize.xsmall }}
      className={className}
      direction="row"
      height={height}
      justify="between"
      pad={{ left: "xsmall", right: "xxsmall" }}
      round={borderSize.small}
      width={width}
    >
      <Text color="gray0" size="component" style={overflowStyle}>
        {label}
      </Text>
      <Selector color="gray0" size={edgeSize.small} />
    </Box>
  );
}

const StyledChooser = styled(Chooser)`
  transition: border-color ${transitionDuration};

  ${(props) => props.isOpen && `border-color: ${colors.gray4};`}

  &:hover {
    border-color: ${colors.gray6};
  }
`;

export default StyledChooser;
