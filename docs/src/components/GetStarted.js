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
          <p className={styles.stepDirection}></p>
        </div>
        <img src="https://data.whicdn.com/images/303699460/original.gif" />
      </div>
      <div className={styles.step}>
        <div className={styles.stepText}>
          <h3>2. Create your test</h3>
          <p className={styles.stepDirection}>
            Use the browser and your actions will be converted into a Puppeteer
            and Jest test:
          </p>
          <CodeBlock value="npx qawolf record <url> [name]" />
          <p className={styles.stepDirection}>
            Your test code is saved at
            <code>.qawolf/tests/yourTestName.test.js</code>. Edit your code
            however you like!
          </p>
        </div>
        <img src="https://data.whicdn.com/images/303699460/original.gif" />
      </div>
      <div className={styles.step}>
        <div className={styles.stepText}>
          <h3>3. Run your test</h3>
          <p className={styles.stepDirection}>
            Use the CLI to run your test locally:
          </p>
          <CodeBlock value="npx qawolf test [name]" />
        </div>
        <img src="https://data.whicdn.com/images/303699460/original.gif" />
      </div>
    </div>
  );
}

export default GetStarted;
