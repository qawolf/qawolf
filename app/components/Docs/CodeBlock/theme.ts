import type { PrismTheme } from "prism-react-renderer";

import { colors } from "../../../theme/theme-new";

// edited dracula theme here
// https://github.com/FormidableLabs/prism-react-renderer/blob/master/src/themes/dracula.js
export const theme: PrismTheme = {
  plain: {
    color: colors.fill20,
    backgroundColor: colors.codeBackground,
  },
  styles: [
    {
      types: ["prolog", "constant", "builtin"],
      style: {
        color: colors.codeTeal,
      },
    },
    {
      types: ["inserted", "function"],
      style: {
        color: colors.codePink,
      },
    },
    {
      types: ["deleted"],
      style: {
        color: colors.textLight,
      },
    },
    {
      types: ["punctuation", "symbol"],
      style: {
        color: colors.codeTeal,
      },
    },
    {
      types: ["boolean", "char", "number", "string", "tag", "selector"],
      style: {
        color: colors.codeYellow,
      },
    },
    {
      types: ["keyword", "variable"],
      style: {
        color: colors.codeTeal,
      },
    },
    {
      types: ["comment"],
      style: {
        color: colors.textLight,
        fontStyle: "italic",
      },
    },
    {
      types: ["attr-name"],
      style: {
        color: colors.codeTeal,
      },
    },
  ],
};
