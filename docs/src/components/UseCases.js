import React, { useState } from "react";
import CodeBlock from "./CodeBlock";
import Features from "./Features";
import Tutorials from "./Tutorials";
import styles from "./UseCases.module.css";

function UseCases() {
  const [useCaseIndex, setUseCaseIndex] = useState(0);

  return (
    <div className={styles.useCases}>
      <CodeBlock useCaseIndex={useCaseIndex} />
      <Tutorials
        setUseCaseIndex={setUseCaseIndex}
        useCaseIndex={useCaseIndex}
      />
      <Features />
    </div>
  );
}

export default UseCases;
