import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import React from "react";
import Argument from "./Argument";

function ArgumentFindPageOptions({ simulate }) {
  return (
    <React.Fragment>
      <Argument
        description={
          <React.Fragment>
            Options to use when finding the{" "}
            <a href="https://github.com/microsoft/playwright/blob/master/docs/api.md#class-page">
              Playwright <code>Page</code>
            </a>{" "}
            instance.
          </React.Fragment>
        }
        name="options"
        optional
        type="Object"
      />
      <Argument
        description={
          <React.Fragment>
            The index of the page to use, starting at <code>0</code> and ordered
            by creation. <b>Default:</b> last used page index.
          </React.Fragment>
        }
        indent
        name="page"
        optional
        type="number"
      />
      <Argument
        description={
          <React.Fragment>
            Maximum amount of time in milliseconds to wait for the page to open
            before timing out. <b>Default:</b> <code>5000</code>.
          </React.Fragment>
        }
        indent
        name="timeoutMs"
        optional
        type="number"
      />

      <Argument
        description={
          <React.Fragment>
            Wait until the page completes all network requests (up to 10 seconds
            per request). <b>Default:</b> <code>true</code>.
          </React.Fragment>
        }
        indent
        name="waitForRequests"
        optional
        type="boolean"
      />
    </React.Fragment>
  );
}

export default ArgumentFindPageOptions;
