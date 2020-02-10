import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import React from "react";
import Argument from "./Argument";

function ArgumentFindPageOptions() {
  return (
    <React.Fragment>
      <Argument
        description="Options to use when determining if the page has text."
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
            Maximum amount of time in milliseconds to wait for the text to
            appear. <b>Default:</b>{" "}
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
    </React.Fragment>
  );
}

export default ArgumentFindPageOptions;
