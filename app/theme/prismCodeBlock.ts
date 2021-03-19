import type { PrismTheme } from "prism-react-renderer";

import { colors, fontFamily, text } from "./theme";

// edited dracula theme here
// https://github.com/FormidableLabs/prism-react-renderer/blob/master/src/themes/dracula.js
export const theme: PrismTheme = {
  plain: {
    backgroundColor: colors.gray10,
    color: colors.gray3,
    fontFamily: fontFamily.code,
    fontSize: text.xxsmall.size,
    lineHeight: text.xxsmall.height,
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
