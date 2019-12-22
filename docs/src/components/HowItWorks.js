import React from "react";
import GetStarted from "./GetStarted";
import styles from "./HowItWorks.module.css";
import SetUpCI from "./SetUpCI";

function HowItWorks() {
  return (
    <section className={styles.howItWorksContainer} id="get-started">
      <GetStarted />
      <SetUpCI />
    </section>
  );
}

export default HowItWorks;
