import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import React from "react";
import Argument from "./Argument";

function ReturnBrowserContext() {
  return (
    <Argument
      description={
        <React.Fragment>
          Resolves to a{" "}
          <Link
            to={useBaseUrl("docs/api/browser_context/class_browser_context")}
          >
            QA Wolf <code>BrowserContext</code>
          </Link>{" "}
          instance.
        </React.Fragment>
      }
      name=""
      type="Promise<BrowserContext>"
    />
  );
}

export default ReturnBrowserContext;
