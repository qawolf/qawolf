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
  codeBackground: "#0A0A30",
  codePink: "#F562A0",
  codeTeal: "#6CCED9",
  codeYellow: "#F0D278",
  error: "#DE4343",
  fill0: "#F5F6FA",
  fill10: "#F2F4F7",
  fill20: "#E6E7EB",
  fill30: "#CED3E0",
  fill50: "#7282A3",
  primaryFill: "#4545E5",
  primaryFillLight: "#8E9CF5",
  primaryHover: "#695EFF",
  primaryTextLight: "#ABB5F5",
  textDark: "#17174C",
  textLight: "#60708A",
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
  eyebrow: "Plex Mono Semibold",
  medium: "Circular Medium",
  normal: "Circular",
};

export const fontWeight = {
  bold: 900,
  medium: 500,
  normal: 400,
};

export const height = {
  navigation: "80px",
};

export const offset = {
  demoVideo: "-80px",
};

export const text = {
  xxsmall: { height: "24px", size: "14px" },
  xsmall: { height: "24px", size: "16px" },
  small: { height: "28px", size: "18px" },
  medium: { height: "32px", size: "22px" },
  large: { height: "36px", size: "28px" },
  xlarge: { height: "40px", size: "36px" },
  xxlarge: { height: "52px", size: "46px" },
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
    overlay: {
      background: "rgba(0, 0, 0, 0.8)",
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
