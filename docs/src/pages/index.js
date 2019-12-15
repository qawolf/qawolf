import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Head from "@docusaurus/Head";
import Layout from "@theme/Layout";
import React from "react";
import Banner from "../components/Banner";
import Subscribe from "../components/Subscribe";
import UseCases from "../components/UseCases";

const headStyles = `
.navbar.navbar--fixed-top { 
  box-shadow: none; 
}

.react-toggle {
  display: none;
}

#mc_embed_signup { 
  background:#fff; 
  clear:left; 
  font:14px Helvetica,Arial,sans-serif; 
  width:100%;
}
`;

function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;

  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <Head>
        <style>{headStyles}</style>
      </Head>
      <header>
        <Banner />
      </header>
      <main>
        <UseCases />
        <Subscribe />
      </main>
    </Layout>
  );
}

export default Home;
