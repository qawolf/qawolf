import React from "react";
import Argument from "./Argument";

function ArgumentCreate() {
  return (
    <React.Fragment>
      <Argument
        description={
          <React.Fragment>
            Emulate a device. <b>Default:</b> <code>"desktop"</code>.
          </React.Fragment>
        }
        name="--device name"
        optional
        type="string"
      />
      <Argument
        description={
          <React.Fragment>
            The path where the test or script will be saved. <b>Default:</b>{" "}
            <code>.qawolf</code>.
          </React.Fragment>
        }
        name="--path path"
        optional
        type="string"
      />
      <Argument
        description={
          <React.Fragment>
            Create a browser script instead of a{" "}
            <a href="https://jestjs.io/">Jest</a> test. <b>Default:</b>{" "}
            <code>false</code>.
          </React.Fragment>
        }
        name="--script"
        optional
        type="boolean"
      />
      <Argument
        description="Visit this URL to begin your test."
        name="url"
        type="string"
      />
      <Argument
        description={
          <React.Fragment>
            The name of your test or script file (will be converted to{" "}
            <a href="https://en.wikipedia.org/wiki/Camel_case">Camel case</a>).{" "}
            The file will be saved at <code>{"{path}/tests/name.test.js"}</code>{" "}
            or <code>{"{path}/scripts/name.js"}</code>. <b>Default:</b> the
            hostname of the provided URL.
          </React.Fragment>
        }
        name="name"
        optional
        type="string"
      />
    </React.Fragment>
  );
}

export default ArgumentCreate;
