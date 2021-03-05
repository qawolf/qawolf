import { edgeSize, theme } from "../theme/theme-new";

// make grommet play nice with storybook
export default {
  ...theme,
  box: {
    responsiveBreakpoint: null,
  },
  icon: {
    size: edgeSize.small,
  },
};
