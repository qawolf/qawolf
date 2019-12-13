import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Head from "@docusaurus/Head";
import Layout from "@theme/Layout";
import React from "react";
import Banner from "../components/Banner";
import UseCases from "../components/UseCases";

const navBarStyles = `
.navbar.navbar--fixed-top { 
  box-shadow: none; 
}

.react-toggle {
  display: none;
}
`;

function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;

  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <Head>
        <style>{navBarStyles}</style>
      </Head>
      <header>
        <Banner />
      </header>
      <main>
        <UseCases />
      </main>
    </Layout>
  );
}

export default Home;
