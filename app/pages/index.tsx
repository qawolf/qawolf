import Create from "../components/Home/Create";
import Hero from "../components/Home/Hero";
import Run from "../components/Home/Run";
import Ship from "../components/Home/Ship";
import Footer from "../components/shared/Footer";
import JoinWolfpack from "../components/shared/JoinWolfpack";
import Navigation from "../components/shared/Navigation";

export default function Home(): JSX.Element {
  return (
    <>
      <Navigation transparentAtTop />
      <Hero />
      <Create />
      <Run />
      <Ship />
      <JoinWolfpack />
      <Footer />
    </>
  );
}
