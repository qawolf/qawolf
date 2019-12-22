import classnames from "classnames";
import React from "react";
import styles from "./Banner.module.css";

function Banner() {
  const handleClick = () => {
    const getStarted = document.getElementById("get-started");
    if (getStarted) getStarted.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className={classnames("hero shadow--lw", styles.bannerContainer)}>
      <div className={classnames("container", styles.banner)}>
        <h1 className="hero__title">Create browser tests 10x faster</h1>
        <p className={classnames("hero__subtitle", styles.tagline)}>
          Open source library for creating Puppeteer and Jest browser tests
        </p>
        <div className={styles.getStarted}>
          <button
            className="button button--primary button--outline button--lg"
            onClick={handleClick}
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}

export default Banner;
