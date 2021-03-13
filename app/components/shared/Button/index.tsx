import { Box, BoxProps, Button as GrommetButton } from "grommet";
import { Icon } from "grommet-icons";
import styled from "styled-components";

import {
  borderSize,
  breakpoints,
  colors,
  edgeSize,
  transition,
  transitionDuration,
} from "../../../theme/theme";
import Text from "../Text";
import Anchor from "./Anchor";
import {
  background,
  height,
  heightDesktop,
  pad,
  round,
  Size,
  textSize,
  Type,
} from "./config";

type Props = {
  IconComponent?: Icon;
  a11yTitle?: string;
  borderColor?: string;
  className?: string;
  disabled?: boolean;
  fill?: BoxProps["fill"];
  href?: string;
  label: string;
  margin?: BoxProps["margin"];
  onClick?: () => void;
  size: Size;
  type?: Type;
  width?: BoxProps["width"];
};

function Button({
  IconComponent,
  a11yTitle,
  className,
  disabled,
  fill,
  href,
  label,
  margin,
  onClick,
  size,
  type,
  width,
}: Props): JSX.Element {
  const finalSize = size || "small";
  const finalType = type || "primary";

  const color = ["invisibleDark", "outlineDark"].includes(type)
    ? "textDark"
    : "white";

  let padding = pad[finalSize] as string;
  if (["outlineDark", "outlineLight"].includes(type)) {
    const borderWidth = ["medium", "large"].includes(size)
      ? borderSize.medium
      : borderSize.small;

    padding = `calc(${edgeSize[padding]} - ${borderWidth})`;
  }

  const innerHtml = (
    <Box
      align="center"
      background={background[finalType]}
      className={className}
      direction="row"
      fill={fill}
      height={height[finalSize]}
      justify="center"
      pad={{ horizontal: padding }}
      round={round[finalSize]}
      width={width}
    >
      {!!IconComponent && (
        <IconComponent
          color={color}
          size={edgeSize.medium}
          style={{ marginRight: edgeSize.small, transition }}
        />
      )}
      <Text color={color} size={textSize[finalSize]} weight="medium">
        {label}
      </Text>
    </Box>
  );

  if (href) {
    return (
      <Anchor href={href} margin={margin} size={finalSize}>
        {innerHtml}
      </Anchor>
    );
  }

  return (
    <GrommetButton
      a11yTitle={a11yTitle || label}
      disabled={disabled}
      margin={margin}
      onClick={onClick}
      plain
    >
      {innerHtml}
    </GrommetButton>
  );
}

const StyledButton = styled(Button)`
  height: ${(props) => height[props.size] || height.small};
  transition: background ${transitionDuration};

  ${(props) =>
    props.type === "outlineLight" &&
    `
    border: ${borderSize.small} solid ${colors.primaryFillLight};
  `}

  &:hover {
    background: ${colors.primaryHover};
  }

  ${(props) =>
    props.type === "invisibleDark" &&
    `
      &:hover {
        background: ${colors.fill10};
      }
    `}

  ${(props) =>
    (props.type === "invisibleLight" || props.type === "outlineLight") &&
    `
      &:hover {
        background: ${colors.primaryFillLight};

        h1,h2,h3,h4,h5,h6,p {
          color: ${colors.textDark};
        }
      }
    `}

  ${(props) =>
    props.type === "outlineDark" &&
    `
      border: ${borderSize.small} solid ${props.borderColor || colors.fill50};

      &:hover {
        background: ${props.borderColor || colors.fill50};

        ${
          !props.borderColor &&
          `
        h1,h2,h3,h4,h5,h6,p {
          color: ${colors.white};
        }

        svg {
          fill: ${colors.white};
        }        
        `
        }
      }
    `}

  ${(props) =>
    ["medium", "large"].includes(props.size) &&
    `
    border-width: ${borderSize.medium};
  `}

  @media screen and (min-width: ${breakpoints.medium.value}px) {
    ${(props) => `
      height: ${heightDesktop[props.size]};
    `}
  }
`;

export default StyledButton;
