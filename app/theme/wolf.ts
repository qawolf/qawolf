import { colors } from "./theme";

export type WolfColors = {
  back: string;
  ear: string;
  earShadow: string;
  eyebrow: string;
  front: string;
  line: string;
  shadow: string;
  sparkle: string;
};

export const getWolfColors = (color?: string | null): WolfColors => {
  switch (color) {
    case "black":
      return {
        back: "#292929",
        ear: "#F0ADAD",
        earShadow: "#1A1A1A",
        eyebrow: "#666666",
        front: "#666666",
        line: "#000000",
        shadow: "#4C4C4C",
        sparkle: "#E5E5E5",
      };
    case "blue":
      return {
        back: colors.gray8,
        ear: "#FABED4",
        earShadow: colors.gray9,
        eyebrow: colors.gray7,
        front: colors.gray6,
        line: colors.gray10,
        shadow: colors.gray7,
        sparkle: colors.gray4,
      };
    case "brown":
      return {
        back: "#66341B",
        ear: "#F0996E",
        earShadow: "#4D250C",
        eyebrow: "#8C6243",
        front: "#8C6243",
        line: "#290D06",
        shadow: "#75462A",
        sparkle: "#DBC2AF",
      };
    case "gold":
      return {
        back: "#996937",
        ear: "#F0996E",
        earShadow: "#7A4F11",
        eyebrow: "#E5D9C5",
        front: "#E5D9C5",
        line: "#382807",
        shadow: "#C7AF8F",
        sparkle: "#E5D9C5",
      };
    case "husky":
      return {
        back: "#575757",
        ear: "#F0ADAD",
        earShadow: "#383838",
        eyebrow: "#A3A3A3",
        front: "#E5E5E5",
        line: "#262626",
        shadow: "#BDBDBD",
        sparkle: "#E5E5E5",
      };
    default:
      return {
        back: colors.gray4,
        ear: "#FABED3",
        earShadow: colors.gray6,
        eyebrow: colors.gray0,
        front: colors.gray0,
        line: colors.gray9,
        shadow: colors.gray3,
        sparkle: colors.gray0,
      };
  }
};
