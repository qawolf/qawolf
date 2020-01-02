import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import classnames from "classnames";
import React from "react";
import CodeBlock from "../components/CodeBlock";
import styles from "./HowItWorks.module.css";

function GetStarted() {
  return (
    <div className={styles.howItWorks}>
      <h1>Get Started</h1>
      <div className={styles.step}>
        <div className={styles.stepText}>
          <h3>1. Install QA Wolf</h3>
          <p className={styles.stepDirection}>
            Install QA Wolf as a dev dependency of your project:
          </p>
          <CodeBlock value="npm i -D qawolf" />
        </div>
        <img src="https://storage.googleapis.com/docs.qawolf.com/home/install-small.gif" />
      </div>
      <div className={styles.step}>
        <div className={styles.stepText}>
          <h3>2. Create your test</h3>
          <p className={styles.stepDirection}>
            Use the browser and your actions will be converted into a{" "}
            <a href="https://pptr.dev/" target="_blank">
              Puppeteer
            </a>{" "}
            and{" "}
            <a href="https://jestjs.io" target="_blank">
              Jest
            </a>{" "}
            test:
          </p>
          <CodeBlock value="npx qawolf record <url> [name]" />
          <p
            className={classnames(styles.stepDirection, styles.noBottomMargin)}
          >
            Your test code is saved at
            <code>.qawolf/tests/yourTestName.test.js</code>.{" "}
            <Link href={useBaseUrl("docs/edit_test_code")}>Edit your code</Link>{" "}
            however you like!
          </p>
        </div>
        <img src="https://storage.googleapis.com/docs.qawolf.com/home/create-test-small.gif" />
      </div>
      <div className={styles.step}>
        <div className={styles.stepText}>
          <h3>3. Run your test</h3>
          <p className={styles.stepDirection}>
            Use the <Link href={useBaseUrl("docs/cli")}>CLI</Link> to run your
            test locally:
          </p>
          <CodeBlock value="npx qawolf test [name]" />
        </div>
        <img src="https://storage.googleapis.com/docs.qawolf.com/home/run-test-small.gif" />
      </div>
    </div>
  );
}

export default GetStarted;
