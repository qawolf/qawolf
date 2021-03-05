import { defaultProps } from "grommet";

import { edgeSize, theme } from "../theme/theme-new";

const defaultTheme = defaultProps.theme;

// make grommet play nice with storybook
export default {
  ...defaultTheme,
  ...theme,
  box: {
    responsiveBreakpoint: null,
  },
  checkBox: {
    ...defaultTheme.checkBox,
    ...theme.checkBox,
  },
  global: {
    ...defaultTheme.global,
    ...theme.global,
    colors: {
      ...defaultTheme.global.colors,
      ...theme.global.colors,
      focus: "transparent",
    },
  },
  icon: {
    size: edgeSize.small,
  },
  radioButton: {
    ...defaultTheme.radioButton,
    ...theme.radioButton,
  },
};
