import classnames from "classnames";
import React from "react";
import styles from "./CodeBlock.module.css";

const CODE_BLOCKS = [
  "npx qawolf record <url> [name]",
  "npx qawolf record --script <url> [name]",
  "npx qawolf github",
  "npx qawolf github"
];

class CodeBlock extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      copySucceeded: null
    };

    this.timeout = null;
    this.handleClick = this.handleClick.bind(this);
  }

  componentWillUnmount() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  handleClick() {
    const { useCaseIndex } = this.props;
    const currentCode = CODE_BLOCKS[useCaseIndex];
    try {
      const textarea = document.createElement("textarea");
      textarea.value = `npm i -D qawolf && ${currentCode}`;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "absolute";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();

      const copySucceeded = document.execCommand("copy");
      document.body.removeChild(textarea);

      this.setState({ copySucceeded });
    } catch (err) {
      this.setState({ copySucceeded: false });
    }

    this.timeout = setTimeout(
      () => this.setState({ copySucceeded: null }),
      3000
    );
  }

  render() {
    const { useCaseIndex } = this.props;
    const { copySucceeded } = this.state;
    const showCopySuccess = copySucceeded !== null;
    const copyClass = copySucceeded ? "success" : "danger";
    const copySuccessMessage = copySucceeded
      ? "Copied to clipboard!"
      : "Error copying to clipboard :(";

    return (
      <div className={styles.codeContainer}>
        <button className={styles.code} onClick={this.handleClick}>
          <p>npm i -D qawolf</p>
          <p>{CODE_BLOCKS[useCaseIndex]}</p>
        </button>
        {showCopySuccess && (
          <button
            className={classnames(`button button--${copyClass}`, styles.copy)}
          >
            {copySuccessMessage}
          </button>
        )}
      </div>
    );
  }
}

export default CodeBlock;
