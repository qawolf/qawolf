import { ThemeValue } from "grommet";

import { isSafari } from "../lib/detection";
import { breakpoints } from "./theme-new";

export const codeFontFamily = "Consolas, Monaco, monospace";

export const customFontLinks = [
  "/fonts/circular-black.woff2",
  "/fonts/circular-black.woff",
  "/fonts/circular-medium.woff2",
  "/fonts/circular-medium.woff",
  "/fonts/circular-regular.woff2",
  "/fonts/circular-regular.woff",
  "/fonts/ibm-plex-mono-semibold.woff2",
  "/fonts/ibm-plex-mono-semibold.woff",
  "/fonts/inter-regular.woff2",
  "/fonts/inter-regular.woff",
  "/fonts/inter-semibold.woff2",
  "/fonts/inter-semibold.woff",
  "/fonts/sofiapro-bold-webfont.ttf",
  "/fonts/sofiapro-bold-webfont.woff",
  "/fonts/sofiapro-regular-webfont.ttf",
  "/fonts/sofiapro-regular-webfont.woff",
];

export const wolfAnimationEasing = "ease-in-out";

export const wolfAnimationOptions = {
  duration: isSafari() ? 0 : 4000,
  fill: "forwards" as const,
};

export const colors = {
  black: "#1C2F46",
  blue: "#4545E6",
  borderBlue: "#D2E0E2",
  borderGray: "#DADFE2",
  borderLight: "#D3D9E0",
  brand: "#44E5E7",
  darkGray: "#233140",
  darkYellow: "#F2D479",
  editorPurple: "#B4C2FF",
  errorRed: "#DE4343",
  fadedBlue: "#387286",
  gray: "#979797",
  green: "#1C857E",
  lightBlue: "#E8F1F1",
  lightBrand: "#3DC6C9",
  lightGray: "#F0F3F5",
  lightGreen: "#C2F3E4",
  lightPurple: "#8E9CF5",
  lightRed: "#E6C8D1",
  limeGreen: "#44E69B",
  navy: "#27646B",
  outlineGray: "#7282A3",
  pink: "#FF8DB4",
  purple: "#7867B3",
  red: "#E3728D",
  teal: "#45D8E5",
  textDark: "#17174D",
  textGray: "#60708A",
  textLight: "#ABB5F5",
  textLighter: "#8A95A6",
  white: "#FFFFFF",
  yellow: "#FFCE54",
};

export const canvasSize = {
  height: 1180,
  width: 1288,
};

export const edgeSize = {
  xsmall: "4px",
  small: "8px",
  medium: "16px",
  large: "32px",
  xlarge: "40px",
  xxlarge: "48px",
  xxxlarge: "64px",
};

export const fontFamily = {
  bold: "Sofia Pro Bold, sans-serif",
  normal: "Sofia Pro, sans-serif",
};

export const fontSize = {
  medium: "16px",
  large: "20px",
  xxlarge: "48px",
};

export const hoverTransition = "all 0.32s";
export const iconSize = "16px";

export const lineHeight = {
  small: "20px",
  medium: "22px",
  large: "28px",
  xxlarge: "38px",
};

export const overflowStyle = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap" as const,
};

export const theme: ThemeValue = {
  anchor: { color: colors.brand },
  box: {
    responsiveBreakpoint: null,
  },
  checkBox: {
    border: { color: { light: colors.gray } },
    color: colors.fadedBlue,
    hover: {
      border: { color: { light: colors.black } },
    },
  },
  global: {
    borderSize: {
      small: "2px",
      medium: "4px",
      large: "8px",
    },
    breakpoints: {
      ...breakpoints,
      large: { edgeSize },
      small: { ...breakpoints.small, edgeSize },
    },
    colors: {
      ...colors,
      control: colors.brand,
      placeholder: colors.textLighter,
    },
    edgeSize,
    focus: {
      border: {
        color: "transparent",
      },
    },
    font: {
      family: fontFamily.normal,
      weight: 400,
    },
  },
  layer: {
    extend: (): { [style: string]: string } => {
      return { cursor: "pointer" };
    },
  },
  meter: { color: colors.fadedBlue },
  select: {
    background: colors.white,
  },
  text: {
    xxsmall: {
      height: "11px",
      size: "8px",
    },
    xsmall: {
      height: "17px",
      size: "12px",
    },
    small: {
      height: lineHeight.small,
      size: "14px",
    },
    medium: {
      height: lineHeight.medium,
      size: fontSize.medium,
    },
    large: {
      height: lineHeight.large,
      size: fontSize.large,
    },
    xlarge: {
      height: "38px",
      size: "32px",
    },
    xxlarge: {
      height: lineHeight.xxlarge,
      size: fontSize.xxlarge,
    },
  },
};
