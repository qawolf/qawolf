import { Box, ThemeContext } from "grommet";

import Overview from "../components/Pricing/Overview";
import Plans from "../components/Pricing/Plans";
import Footer from "../components/shared-new/Footer";
import JoinWolfpack from "../components/shared-new/JoinWolfpack";
import Navigation from "../components/shared-new/Navigation";
import { theme } from "../theme/theme-new";

export default function Pricing(): JSX.Element {
  return (
    <ThemeContext.Extend value={theme}>
      <Box>
        <Navigation />
        <Box overflow={{ vertical: "auto" }}>
          <Overview />
          <Plans />
          <JoinWolfpack />
          <Footer />
        </Box>
      </Box>
    </ThemeContext.Extend>
  );
}
