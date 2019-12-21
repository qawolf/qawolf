import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import React from "react";
import styles from "./Features.module.css";

function Features() {
  return (
    <section className={styles.featuresContainer}>
      <div className={styles.features}>
        <div className={styles.feature}>
          <h4>😌 No more boilerplate</h4>
          <p>Your browser actions are converted to Puppeteer and Jest code</p>
        </div>
        <div className={styles.feature}>
          <h4>⚓ Built for stability</h4>
          <p>
            Avoid flaky tests with automatic waiting and smart element selectors
          </p>
        </div>
        <div className={styles.feature}>
          <h4>👷 Test complex scenarios</h4>
          <p>
            Test your application like a user - use third party sites, multiple
            windows, and hot keys
          </p>
        </div>
        <div className={styles.feature}>
          <h4>☁️ One command CI</h4>
          <p>Run your tests in CI with one command, on push or on a schedule</p>
        </div>
        <div className={styles.feature}>
          <h4>🐛 Easy debugging</h4>
          <p>
            Each test run in CI includes a video, GIF, interactive DOM
            recording, and detailed logs
          </p>
        </div>
        <div className={styles.feature}>
          <h4>📖 Open source</h4>
          <p>
            Inspect (and contribute to!) the code, and reach out with feedback
            and requests
          </p>
        </div>
      </div>
    </section>
  );
}

export default Features;
