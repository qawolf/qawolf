import { colors } from "./theme-new";

type WolfColors = {
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
