import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import React from "react";
import styles from "./Features.module.css";

function Features() {
  return (
    <section className={styles.features}>
      <div className={styles.featureRow}>
        <div className={styles.feature}>
          <h4>😌 effortless</h4>
          <p>
            Generate{" "}
            <Link href={useBaseUrl("docs/edit_your_code")}>Puppeteer code</Link>{" "}
            you can edit.
          </p>
          <p>
            <Link href={useBaseUrl("docs/set_up_ci")}>Set up CI</Link> with one
            command.
          </p>
        </div>
        <div className={styles.feature}>
          <h4>⚓ stable</h4>
          <p>
            {" "}
            <Link href={useBaseUrl("docs/how_it_works#-element-selectors")}>
              Automatically find
            </Link>{" "}
            elements.
          </p>
          <p>
            <Link href={useBaseUrl("docs/how_it_works#-automatic-waiting")}>
              Automatically wait
            </Link>{" "}
            for assertions
          </p>
        </div>
      </div>
      <div className={styles.featureRow}>
        <div className={styles.feature}>
          <h4>🐛 easy to debug</h4>
          <p>
            Watch the{" "}
            <Link href={useBaseUrl("docs/set_up_ci#debug")}>
              video, gif, or dom recording.
            </Link>
          </p>
          <p>Read detailed logs.</p>
        </div>
        <div className={styles.feature}>
          <h4>📖 open source</h4>
          <p>
            Inspect (and contribute to!) the{" "}
            <Link href="https://github.com/qawolf/qawolf">code.</Link>
          </p>
          <p>
            {" "}
            <Link href="https://gitter.im/qawolf/community">
              Reach out
            </Link>{" "}
            with feedback or requests.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Features;
