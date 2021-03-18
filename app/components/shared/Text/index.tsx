import { Text as GrommetText, TextProps } from "grommet";
import { CSSProperties, ReactNode } from "react";
import styled from "styled-components";

import {
  breakpoints,
  colors,
  fontFamily,
  fontWeight,
  textDesktop,
  transitionDuration,
} from "../../../theme/theme";
import { defaultTag, hoverColor, Size, Weight } from "./config";

type Props = {
  children: ReactNode;
  className?: string;
  color?: string;
  hover?: boolean;
  margin?: TextProps["margin"];
  size: Size;
  textAlign?: TextProps["textAlign"];
  textAs?: TextProps["as"];
  style?: CSSProperties;
  weight?: Weight;
};

function Text({
  children,
  className,
  color,
  margin,
  size,
  style,
  textAlign,
  textAs,
}: Props): JSX.Element {
  return (
    <GrommetText
      as={textAs || defaultTag[size]}
      className={className}
      color={color || "textDark"}
      margin={margin}
      size={size}
      style={style}
      textAlign={textAlign}
    >
      {children}
    </GrommetText>
  );
}

const StyledText = styled(Text)`
  transition: color ${transitionDuration};

  ${(props) =>
    ["xxlarge", "xlarge", "large", "medium"].includes(props.size) &&
    `
  letter-spacing: -0.03em;
  `}

  ${(props) =>
    props.size === "eyebrow" &&
    `
  letter-spacing: 0.3em;
  `}

  ${(props) =>
    `
  font-family: ${fontFamily[props.weight]};
  font-weight: ${fontWeight[props.weight]};
  `}

  ${(props) =>
    [
      "component",
      "componentParagraph",
      "componentParagraphLarge",
      "componentSmall",
    ].includes(props.size) &&
    `
  font-family: Inter;
  font-weight: 400;

  b {
    font-family: ${fontFamily.componentBold};
    font-weight: ${fontWeight.semibold};
  }
  `}

  ${(props) =>
    props.size === "componentMedium" &&
    `
  font-family: Inter Medium;
  font-weight: 500;
  `}

  ${(props) =>
    [
      "componentBold",
      "componentHeader",
      "componentHeaderLarge",
      "componentLarge",
      "componentXLarge",
    ].includes(props.size) &&
    `
  font-family: Inter Semibold;
  font-weight: 600;
  `}

  ${(props) =>
    props.size === "eyebrow" &&
    `
  font-family: Plex Mono Semibold;
  font-weight: 600;
  text-transform: uppercase;
  `}

  ${(props) =>
    props.hover &&
    `
  &:hover {
    color: ${hoverColor[props.color] || colors.primaryTextLight};
  }
  `}

  @media screen and (min-width: ${breakpoints.medium.value}px) {
    font-size: ${(props) => textDesktop[props.size].size};
    line-height: ${(props) => textDesktop[props.size].height};
  }
`;

export default StyledText;
