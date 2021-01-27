import { Box, Button, ButtonProps } from "grommet";
import { Icon } from "grommet-icons";
import styled from "styled-components";
import {
  borderSize,
  colors,
  edgeSize,
  transitionDuration,
} from "../../../theme/theme-new";
import { Type, hoverBackground, hoverIconColor } from "./config";

type Props = {
  IconComponent?: Icon;
  a11yTitle?: string;
  className?: string;
  hoverType?: Type;
  label?: string;
  margin?: ButtonProps["margin"];
  onClick: () => void;
};

function AppButton({
  IconComponent,
  a11yTitle,
  className,
  label,
  margin,
  onClick,
}: Props): JSX.Element {
  return (
    <Button
      a11yTitle={a11yTitle || label}
      margin={margin}
      onClick={onClick}
      plain
    >
      <Box className={className} pad="xxsmall" round={borderSize.small}>
        {!!IconComponent && (
          <IconComponent color={colors.gray9} size={edgeSize.small} />
        )}
      </Box>
    </Button>
  );
}

const StyledAppButton = styled(AppButton)`
  transition: background ${transitionDuration};

  svg {
    transition: fill ${transitionDuration};
  }

  &:hover {
    background: ${colors.gray2};

    ${(props) =>
      !!props.hoverType &&
      `
    background: ${colors[hoverBackground[props.hoverType]]};

    svg {
      fill: ${colors[hoverIconColor[props.hoverType]]};
    }
    `}
  }
`;

export default StyledAppButton;
