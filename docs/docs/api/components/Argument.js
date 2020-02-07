import classNames from "classnames";
import React from "react";
import styles from "./css/Argument.module.css";

function Argument({ description, indent, name, optional, type }) {
  let formattedName = optional ? `[${name}]` : name;

  return (
    <p className={classNames(styles.argument, { [styles.indent]: indent })}>
      <span className={styles.name}>{formattedName}</span>{" "}
      <span className={styles.type}>{`(${type})`}</span>: {description}
    </p>
  );
}

export default Argument;
