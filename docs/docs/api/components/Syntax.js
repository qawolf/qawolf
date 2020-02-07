import React from "react";
import styles from "./css/Syntax.module.css";

function Syntax({ code }) {
  return <p className={styles.code}>{code}</p>;
}

export default Syntax;
