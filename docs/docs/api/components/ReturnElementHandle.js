import React from "react";
import Argument from "./Argument";

function ReturnElementHandle() {
  return (
    <Argument
      description={
        <React.Fragment>
          Resolves to the corresponding{" "}
          <a href="https://github.com/microsoft/playwright/blob/v0.10.0/docs/api.md#class-elementhandle">
            Playwright <code>ElementHandle</code>
          </a>{" "}
          instance.
        </React.Fragment>
      }
      name=""
      type="Promise<ElementHandle>"
    />
  );
}

export default ReturnElementHandle;
