import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import React from "react";
import Argument from "./Argument";

function ArgumentFindElementOptions() {
  return (
    <React.Fragment>
      <Argument
        description="Options to use when finding the element."
        name="options"
        optional
        type="Object"
      />
      <Argument
        description={
          <React.Fragment>
            The index of the page that contains the element, starting at 0 and
            ordered by creation. <b>Default:</b> last used page index.
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
            Sleep after finding an element for this amount of time in
            milliseconds. <b>Default:</b>{" "}
            <Link
              to={useBaseUrl("docs/api/environment_variables#qaw_sleep_ms")}
            >
              <code>QAW_SLEEP_MS</code>
            </Link>
            .
          </React.Fragment>
        }
        indent
        name="sleepMs"
        optional
        type="number"
      />
      <Argument
        description={
          <React.Fragment>
            Maximum amount of time in milliseconds to wait for an element before
            timing out. <b>Default:</b>{" "}
            <Link
              to={useBaseUrl("docs/api/environment_variables#qaw_timeout_ms")}
            >
              <code>QAW_TIMEOUT_MS</code>
            </Link>
            .
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

export default ArgumentFindElementOptions;
