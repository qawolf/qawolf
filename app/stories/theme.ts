import { edgeSize, theme } from "../theme/theme-new";

export default {
  ...theme,
  box: {
    // prevent default grommet styling on mobile as we handle manually
    responsiveBreakpoint: null,
  },
  icon: {
    size: edgeSize.small,
  },
};
