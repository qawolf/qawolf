import classnames from "classnames";
import React from "react";
import styles from "./Banner.module.css";

const USE_CASES = [
  "browser tests ✅",
  "browser scripts 🤖",
  "setting up CI ☁️",
  "easy debugging 🐛"
];

class Banner extends React.Component {
  constructor(props) {
    super(props);

    this.timeout = null;

    this.state = {
      isVisible: false,
      useCaseIndex: USE_CASES.length - 1
    };
  }

  componentDidMount() {
    this.tick();
  }

  componentWillUnmount() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  tick() {
    const { isVisible, useCaseIndex } = this.state;
    let delta = 3000;

    if (isVisible) {
      delta = 800; // don't pause so much after deleting
      this.setState({ isVisible: false });
    } else {
      const nextUseCaseIndex = (useCaseIndex + 1) % USE_CASES.length;

      this.setState({ isVisible: true, useCaseIndex: nextUseCaseIndex });
    }

    this.timeout = setTimeout(() => this.tick(), delta);
  }

  render() {
    const { isVisible, useCaseIndex } = this.state;
    const useCaseClass = classnames(
      "hero__title",
      styles.bannerTitle,
      styles.animate,
      {
        [styles.hidden]: !isVisible,
        [styles.visible]: isVisible
      }
    );

    return (
      <div className={styles.banner}>
        <h1
          className={classnames(
            "hero__title",
            styles.bannerTitle,
            styles.bannerPadding
          )}
        >
          Free and open source recorder for
        </h1>
        <div className={styles.useCase}>
          <h1 className={useCaseClass}>{USE_CASES[useCaseIndex]}</h1>
          <h1 className={classnames("hero__title", styles.cursor)}>|</h1>
        </div>
      </div>
    );
  }
}

export default Banner;
