import type { PrismTheme } from "prism-react-renderer";

import { colors } from "../../../theme/theme-new";

// edited dracula theme here
// https://github.com/FormidableLabs/prism-react-renderer/blob/master/src/themes/dracula.js
export const theme: PrismTheme = {
  plain: {
    color: colors.gray3,
    backgroundColor: colors.gray10,
  },
  styles: [
    {
      types: ["deleted"],
      style: {
        color: colors.gray7,
      },
    },
    {
      types: ["punctuation", "symbol"],
      style: {
        color: colors.codeBlue,
      },
    },
    {
      types: ["char", "number", "string", "tag", "selector"],
      style: {
        color: colors.codePink,
      },
    },
    {
      types: [
        "attr-name",
        "boolean",
        "constant",
        "inserted",
        "keyword",
        "variable",
      ],
      style: {
        color: colors.codePurple,
      },
    },
    {
      types: ["comment"],
      style: {
        color: colors.gray7,
        fontStyle: "italic",
      },
    },
  ],
};
