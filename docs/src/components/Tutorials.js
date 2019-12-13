import React from "react";
import styles from "./Tutorials.module.css";

const TUTORIALS = [
  {
    label: "✅ browser tests",
    title: "✅ Create a browser test in 1 minute",
    videoLink: "https://storage.googleapis.com/docs.qawolf.com/home/record.gif"
  },
  {
    label: "🤖 browser scripts",
    title: "🤖 Create a browser script in 1 minute",
    videoLink: "https://storage.googleapis.com/docs.qawolf.com/home/script.gif"
  },
  {
    label: "☁️ set up CI",
    title: "☁️ Set up CI in 10 seconds",
    videoLink: "https://storage.googleapis.com/docs.qawolf.com/home/github.gif"
  },
  {
    label: "🐛 easy to debug",
    title: "🐛 Watch a video, gif, or dom recording",
    videoLink: "https://storage.googleapis.com/docs.qawolf.com/home/debug.gif"
  }
];

function Tutorials({ useCaseIndex, setUseCaseIndex }) {
  const tabsHtml = TUTORIALS.map((tutorial, idx) => {
    const activeClass = idx === useCaseIndex ? " pill-item--active" : "";

    return (
      <li
        className={`pill-item${activeClass}`}
        key={idx}
        onClick={() => setUseCaseIndex(idx)}
      >
        {tutorial.label}
      </li>
    );
  });

  const tutorial = TUTORIALS[useCaseIndex];

  return (
    <div className={styles.tutorials}>
      <div className={styles.tutorialsHeader}>
        <h3>{tutorial.title}</h3>
        <ul className="pills pills--block">{tabsHtml}</ul>
      </div>
      <div className={styles.video}>
        <img src={tutorial.videoLink} alt="QA Wolf in action" />
      </div>
    </div>
  );
}

export default Tutorials;
