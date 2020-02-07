import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import React from "react";
import Argument from "./Argument";

function ArgumentSelector() {
  return (
    <React.Fragment>
      <Argument
        description={
          <React.Fragment>
            Find an element that matches this selector.{" "}
            <b>
              Must specify <code>css</code>,<code>html</code>, or{" "}
              <code>text</code>
            </b>
            .
          </React.Fragment>
        }
        name="selector"
        type="Object"
      />
      <Argument
        description={
          <React.Fragment>
            Find the visible element that matches this{" "}
            <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors">
              CSS selector
            </a>
            .
          </React.Fragment>
        }
        indent
        name="css"
        optional
        type="string"
      />
      <Argument
        description={
          <React.Fragment>
            Find the closest match to this{" "}
            <a href="https://developer.mozilla.org/en-US/docs/Web/HTML">HTML</a>
            . Only recommended for use in the{" "}
            <Link
              to={useBaseUrl(
                "docs/use_custom_selectors#default-selector-logic"
              )}
            >
              default selector logic
            </Link>
            .
          </React.Fragment>
        }
        indent
        name="html"
        optional
        type="string"
      />
      <Argument
        description="Find the visible element that contains this text."
        indent
        name="text"
        optional
        type="string"
      />
    </React.Fragment>
  );
}

export default ArgumentSelector;
