import classnames from "classnames";
import React from "react";
import styles from "./Banner.module.css";
import CodeBlock from "./CodeBlock";

function Banner() {
  return (
    <div className={classnames(styles.bannerContainer)}>
      <div className={classnames("container", styles.banner)}>
        <h1 className="hero__title">Create browser tests 10x faster</h1>
        <p className={classnames("hero__subtitle", styles.tagline)}>
          Open source library for creating browser tests and running them in CI
        </p>
        <div className={styles.codeblock}>
          <CodeBlock />
        </div>
      </div>
    </div>
  );
}

export default Banner;
