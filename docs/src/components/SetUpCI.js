import classnames from "classnames";
import React, { useState } from "react";
import CodeBlock from "./CodeBlock";
import styles from "./HowItWorks.module.css";

const CI_PROVIDERS = [
  {
    command: "azure",
    logo: "https://cdn.iconscout.com/icon/free/png-256/azure-190760.png",
    name: "Azure"
  },
  {
    command: "circleci",
    logo: "https://cdn.iconscout.com/icon/free/png-256/circleci-283066.png",
    name: "CircleCI"
  },
  {
    command: "github",
    logo:
      "https://camo.githubusercontent.com/7710b43d0476b6f6d4b4b2865e35c108f69991f3/68747470733a2f2f7777772e69636f6e66696e6465722e636f6d2f646174612f69636f6e732f6f637469636f6e732f313032342f6d61726b2d6769746875622d3235362e706e67",
    name: "GitHub"
  },
  {
    command: "gitlab",
    logo:
      "https://pragmaticintegrator.files.wordpress.com/2015/12/logo-gitlab.png",
    name: "GitLab"
  }
];

function SetUpCI() {
  const [tabIndex, setTabIndex] = useState(0);

  const tabsHtml = CI_PROVIDERS.map((provider, idx) => {
    const className =
      idx === tabIndex ? "pill-item pill-item--active" : "pill-item";

    return (
      <li className={className} key={idx} onClick={() => setTabIndex(idx)}>
        <div className={styles.tabContainer}>
          <div className={styles.tab}>
            <img className={styles.logo} src={provider.logo} />
            {provider.name}
          </div>
        </div>
      </li>
    );
  });

  return (
    <div className={styles.howItWorks}>
      <h1>Run Tests in CI</h1>
      <ul className={classnames("pills pills--block", styles.tabs)}>
        {tabsHtml}
      </ul>
      <div className={styles.step}>
        <div className={styles.stepText}>
          <h3>One command CI</h3>
          <p className={styles.stepDirection}>
            Set up running your tests in CI:
          </p>
          <CodeBlock value={`npx qawolf ${CI_PROVIDERS[tabIndex].command}`} />
          <p className={styles.stepDirection}>
            A config file for your CI provider will be created in your project.
            Edit this file to suit your use case.
          </p>
        </div>
        <img src="https://data.whicdn.com/images/303699460/original.gif" />
      </div>
    </div>
  );
}

export default SetUpCI;
