import { defaultProps } from "grommet";

import { edgeSize, theme } from "../theme/theme-new";

// make grommet play nice with storybook
export default {
  ...defaultProps.theme,
  ...theme,
  box: {
    responsiveBreakpoint: null,
  },
  checkBox: {
    ...defaultProps.theme.checkBox,
    ...theme.checkBox,
  },
  global: {
    ...defaultProps.theme.global,
    ...theme.global,
    colors: {
      ...defaultProps.theme.global.colors,
      ...theme.global.colors,
      focus: "transparent",
    },
  },
  icon: {
    size: edgeSize.small,
  },
};
