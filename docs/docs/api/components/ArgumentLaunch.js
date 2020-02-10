import React from "react";
import Argument from "./Argument";

function ArgumentLaunch() {
  return (
    <React.Fragment>
      <Argument description="Launch options." name="options" type="Object" />
      <Argument
        description={
          <React.Fragment>
            Emulate this{" "}
            <a href="https://github.com/Microsoft/playwright/blob/master/src/deviceDescriptors.ts">
              device
            </a>
            . <b>Default:</b> <code>"desktop"</code>.
          </React.Fragment>
        }
        indent
        name="device"
        optional
        type="string"
      />
      <Argument
        description={
          <React.Fragment>
            Maximum navigation timeout in milliseconds. Pass <code>0</code> to
            disable timeout. <b>Default:</b> <code>30000</code>.
          </React.Fragment>
        }
        indent
        name="navigationTimeoutMs"
        optional
        type="number"
      />
      <Argument
        description={
          <React.Fragment>
            The{" "}
            <a href="https://developer.mozilla.org/en-US/docs/Web/API/URL">
              URL
            </a>{" "}
            to go to.
          </React.Fragment>
        }
        indent
        name="url"
        type="string"
      />
    </React.Fragment>
  );
}

export default ArgumentLaunch;
