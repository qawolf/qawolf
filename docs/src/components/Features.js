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
          <p>
            Your browser actions are converted to Puppeteer and Jest code. Test
            your application like a user - QA Wolf supports third party sites,
            multiple windows, and hot keys.
          </p>
        </div>
        <div className={styles.feature}>
          <h4>⚓ Built for stability</h4>
          <p>
            Avoid flaky tests. Generated test code automatically waits for the
            next element or assertion. Smart element selectors target elements
            using multiple attributes.
          </p>
        </div>
        <div className={styles.feature}>
          <h4>☁️ One command CI</h4>
          <p>
            Run your tests in CI with one command, on push or on a schedule.
            Debug easily with a video, GIF, interactive DOM recording, and
            detailed logs.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Features;
