import { ThemeContext } from "grommet";

import Create from "../components/Home/Create";
import Hero from "../components/Home/Hero";
import Run from "../components/Home/Run";
import Ship from "../components/Home/Ship";
import Footer from "../components/shared-new/Footer";
import JoinWolfpack from "../components/shared-new/JoinWolfpack";
import Navigation from "../components/shared-new/Navigation";
import { theme } from "../theme/theme-new";

export default function Home(): JSX.Element {
  return (
    <ThemeContext.Extend value={theme}>
      <Navigation transparentAtTop />
      <Hero />
      <Create />
      <Run />
      <Ship />
      <JoinWolfpack />
      <Footer />
    </ThemeContext.Extend>
  );
}
