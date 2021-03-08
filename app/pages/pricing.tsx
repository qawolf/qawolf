import { Box } from "grommet";

import Overview from "../components/Pricing/Overview";
import Plans from "../components/Pricing/Plans";
import Footer from "../components/shared/Footer";
import JoinWolfpack from "../components/shared/JoinWolfpack";
import Navigation from "../components/shared/Navigation";

export default function Pricing(): JSX.Element {
  return (
    <Box>
      <Navigation />
      <Box overflow={{ vertical: "auto" }}>
        <Overview />
        <Plans />
        <JoinWolfpack />
        <Footer />
      </Box>
    </Box>
  );
}
