import React from "react";
import Argument from "./Argument";

function ArgumentSelectValue() {
  return (
    <Argument
      description={
        <React.Fragment>
          The value to select. To clear the <code>select</code> element, pass{" "}
          <code>null</code> as the value.
        </React.Fragment>
      }
      name="value"
      type="string | null"
    />
  );
}

export default ArgumentSelectValue;
