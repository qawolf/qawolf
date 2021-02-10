import { Box, Button } from "grommet";
import { CSSProperties } from "react";
import styled from "styled-components";

import { NavigationType } from "../../../lib/types";
import {
  borderSize,
  colors,
  edgeSize,
  transitionDuration,
} from "../../../theme/theme-new";
import Text from "../Text";

type Props = {
  className?: string;
  isSelected: boolean;
  label: string;
  onClick: () => void;
  style?: CSSProperties;
  type?: NavigationType;
};

const borderHeight = `calc(${borderSize.small} + ${borderSize.xsmall})`;

function Tab({
  className,
  isSelected,
  label,
  onClick,
  style,
  type,
}: Props): JSX.Element {
  const baseColor = type === "light" ? "gray7" : "gray5";
  const selectedColor = type === "light" ? "gray9" : "gray0";

  return (
    <Button
      a11yTitle={label}
      className={className}
      onClick={onClick}
      plain
      style={style}
    >
      <Box pad={{ top: "small" }}>
        <Text
          color={isSelected ? selectedColor : baseColor}
          size="component"
          textAlign="center"
        >
          {label}
        </Text>
        <Box
          background={isSelected ? "primary" : "transparent"}
          height={borderHeight}
          margin={{ top: `calc(${edgeSize.small} - ${borderSize.small})` }}
        />
      </Box>
    </Button>
  );
}

const StyledTab = styled(Tab)`
  // slight overlap with tabs container border
  margin-bottom: -${borderSize.xsmall};

  p {
    transition: color ${transitionDuration};
  }

  &:hover {
    p {
      color: ${(props) =>
        props.type === "light" ? colors.gray8 : colors.gray3};
    }
  }

  &:active {
    p {
      color: ${(props) =>
        props.type === "light" ? colors.gray9 : colors.gray0};
    }
  }
`;

export default StyledTab;
