import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import React from "react";
import styles from "./Features.module.css";

function Features() {
  return (
    <section className={styles.featuresContainer}>
      <div className={styles.features}>
        <div className={styles.feature}>
          <h4>😌 Skip writing boilerplate</h4>
          <p>
            Convert your browser actions into code. QA Wolf supports complex
            workflows including third party sites, multiple windows, and hot
            keys.
          </p>
        </div>
        <div className={styles.feature}>
          <h4>⚓ Built for stability</h4>
          <p>
            Avoid flaky tests. The{" "}
            <a href="https://www.npmjs.com/package/qawolf" target="_blank">
              qawolf node
            </a>{" "}
            library{" "}
            <Link href={useBaseUrl("docs/how_it_works#️-automatic-waiting")}>
              automatically waits
            </Link>{" "}
            for the next element or assertion.{" "}
            <Link href={useBaseUrl("docs/how_it_works#-element-selectors")}>
              Smart element selectors
            </Link>{" "}
            target elements using multiple attributes.
          </p>
        </div>
        <div className={styles.feature}>
          <h4>☁️ One command CI</h4>
          <p>
            <Link href={useBaseUrl("docs/set_up_ci")}>
              Run your tests in CI
            </Link>{" "}
            with one command, on push or on a schedule.{" "}
            <Link href={useBaseUrl("docs/set_up_ci#️-debug")}>
              Debug easily
            </Link>{" "}
            with a video, GIF, interactive DOM recording, and detailed logs.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Features;
