import React from "react";
import styles from "./css/Syntax.module.css";

function Syntax({ code }) {
  return (
    <div className={styles.syntax}>
      <p className={styles.code}>{code}</p>
    </div>
  );
}

export default Syntax;
