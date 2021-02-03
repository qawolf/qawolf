import { useContext, useEffect, useRef } from "react";

import { RunnerContext } from "../contexts/RunnerContext";
import type { Browser } from "../hooks/browser";

type Props = {
  browser: Browser;
  height: number;
  isVisible: boolean;
  width: number;
};

export default function Screencast({
  browser,
  height,
  isVisible,
  width,
}: Props): JSX.Element {
  const { apiKey, wsUrl } = useContext(RunnerContext);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!browser || !containerRef.current) return;

    browser.connect(
      containerRef.current,
      wsUrl ? `${wsUrl}/websockify` : null,
      apiKey || "local"
    );
  }, [apiKey, browser, containerRef, wsUrl]);

  useEffect(() => {
    if (!browser || !isVisible) return;

    // force a re-render after it is hidden with display: none
    browser.refresh();
  }, [browser, isVisible]);

  return (
    <div
      id="browser"
      ref={containerRef}
      style={{
        display: isVisible ? "initial" : "none",
        height,
        width,
      }}
      // need to specify tabIndex for chrome to respect .focus()
      tabIndex={0}
    />
  );
}
