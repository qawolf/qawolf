export const borderSize = {
  xsmall: "1px",
  small: "2px",
  medium: "4px",
};

export const breakpoints = {
  small: { value: 960 },
  medium: { value: 1264 },
};

export const colors = {
  code: "#0E8A7D",
  codeBlue: "#6E9DFA",
  codeHighlight: "#213866",
  codePink: "#EF86B4",
  codePurple: "#B899F8",
  danger4: "#F07D7D",
  danger5: "#DB4B4B",
  danger9: "#66141B",
  danger10: "#33050D",
  dangerDark: "#C23232",
  dangerDarker: "#AD1F1F",
  error: "#DE4343",
  fill0: "#F5F6FA",
  fill10: "#F2F4F7",
  fill20: "#E6E7EB",
  fill30: "#CED3E0",
  fill50: "#7282A3",
  gray0: "#FFFFFF",
  gray2: "#F2F4F7",
  gray3: "#E9ECF2",
  gray4: "#C9D0DB",
  gray5: "#ABB3C2",
  gray6: "#8992A3",
  gray7: "#667080",
  gray8: "#404857",
  gray9: "#2A3140",
  gray10: "#151B26",
  primary: "#4545E5",
  primaryDark: "#2F2FC2",
  primaryDarker: "#1D1DA3",
  primaryFill: "#4545E5",
  primaryFillLight: "#8E9CF5",
  primaryHover: "#695EFF",
  primaryTextLight: "#ABB5F5",
  success5: "#44C76B",
  textDark: "#17174C",
  textLight: "#60708A",
  warning4: "#EBC963",
  warning9: "#615013",
  warning10: "#332B05",
  white: "#FFFFFF",
};

export const edgeSize = {
  xxxsmall: "4px",
  xxsmall: "8px",
  xsmall: "12px",
  small: "16px",
  medium: "24px",
  large: "32px",
  xlarge: "40px",
  xxlarge: "48px",
  xxxlarge: "64px",
};

export const fontFamily = {
  bold: "Circular Black",
  component: "Inter",
  componentBold: "Inter Semibold",
  componentHeader: "Inter Semibold",
  componentParagraph: "Inter",
  eyebrow: "Plex Mono Semibold",
  medium: "Circular Medium",
  normal: "Circular",
};

export const fontWeight = {
  bold: 900,
  semibold: 600,
  medium: 500,
  normal: 400,
};

export const height = {
  navigation: "80px",
};

export const offset = {
  demoVideo: "-80px",
};

export const overflowStyle = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap" as const,
};

export const text = {
  xxsmall: { height: "24px", size: "14px" },
  xsmall: { height: "24px", size: "16px" },
  small: { height: "28px", size: "18px" },
  medium: { height: "32px", size: "22px" },
  large: { height: "36px", size: "28px" },
  xlarge: { height: "40px", size: "36px" },
  xxlarge: { height: "52px", size: "46px" },
  component: { height: "16px", size: "14px" },
  componentBold: { height: "16px", size: "14px" },
  componentHeader: { height: "24px", size: "18px" },
  componentParagraph: { height: "20px", size: "14px" },
  eyebrow: { height: "18px", size: "16px" },
};

export const textDesktop = {
  xxsmall: { height: "24px", size: "14px" },
  xsmall: { height: "28px", size: "18px" },
  small: { height: "30px", size: "20px" },
  medium: { height: "40px", size: "28px" },
  large: { height: "52px", size: "40px" },
  xlarge: { height: "62px", size: "56px" },
  xxlarge: { height: "84px", size: "76px" },
  component: { height: "16px", size: "14px" },
  componentBold: { height: "16px", size: "14px" },
  componentHeader: { height: "24px", size: "18px" },
  componentParagraph: { height: "20px", size: "14px" },
  eyebrow: { height: "18px", size: "16px" },
};

export const theme = {
  box: {
    // prevent default grommet styling on mobile as we handle manually
    responsiveBreakpoint: "1px",
  },
  global: {
    borderSize,
    colors,
    control: {
      border: {
        radius: edgeSize.xsmall,
        width: borderSize.medium,
      },
    },
    edgeSize,
  },
  layer: {
    border: {
      radius: edgeSize.xxsmall,
    },
    overlay: {
      background: "rgba(21, 27, 38, 0.6)",
    },
    responsiveBreakpoint: null,
  },
  text,
};

export const transitionDuration = "0.2s ease-in-out";
export const transition = `all ${transitionDuration}`;

export const width = {
  content: "1080px",
  demoVideoPlay: "216px",
  docsSidebar: "280px",
};
