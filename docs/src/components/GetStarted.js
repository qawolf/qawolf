import React from "react";
import CodeBlock from "../components/CodeBlock";
import styles from "./HowItWorks.module.css";

function GetStarted() {
  return (
    <div className={styles.howItWorks}>
      <h1>Get Started</h1>
      <div className={styles.step}>
        <div className={styles.stepText}>
          <h3>1. Open your web application</h3>
          <p className={styles.stepDirection}>Install QA Wolf if needed:</p>
          <CodeBlock value="npm i -D qawolf" />
          <p className={styles.stepDirection}>
            Open Chromium browser with injected QA Wolf library:
          </p>
          <CodeBlock value="npx qawolf record <url> [name]" />
        </div>
        <img src="https://data.whicdn.com/images/303699460/original.gif" />
      </div>
      <div className={styles.step}>
        <div className={styles.stepText}>
          <h3>2. Go through workflow</h3>
          <p className={styles.stepDirection}>
            Your browser actions (like clicking and typing) will be captured to
            convert to Puppeteer and Jest code.
          </p>
        </div>
        <img src="https://data.whicdn.com/images/303699460/original.gif" />
      </div>
      <div className={styles.step}>
        <div className={styles.stepText}>
          <h3>3. Get code!</h3>
          <p className={styles.stepDirection}>
            A file called <code>.qawolf/tests/yourTestName.test.js</code> will
            be created in your project. By default it includes automatic waiting
            and smart element selectors. Edit this file as you like!
          </p>
        </div>
        <img src="https://data.whicdn.com/images/303699460/original.gif" />
      </div>
    </div>
  );
}

export default GetStarted;
