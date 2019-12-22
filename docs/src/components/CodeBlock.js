import classnames from "classnames";
import React from "react";
import styles from "./CodeBlock.module.css";

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
    try {
      const textarea = document.createElement("textarea");
      textarea.value = this.props.value;
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
    const { copySucceeded } = this.state;
    const showCopySuccess = copySucceeded !== null;
    const copyClass = copySucceeded ? "primary" : "danger";
    const copySuccessMessage = copySucceeded
      ? "Copied to clipboard!"
      : "Error copying to clipboard :(";

    return (
      <div className={styles.codeContainer}>
        <button className={styles.code} onClick={this.handleClick}>
          <p>{this.props.value}</p>
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
