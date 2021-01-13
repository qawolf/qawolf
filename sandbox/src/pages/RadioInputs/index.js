import React from "react";
import HtmlRadioInputs from "./HtmlRadioInputs";
import MaterialUiRadioInputs from "./MaterialUiRadioInputs";

function RadioInputs() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap" }}>
      <HtmlRadioInputs />
      <MaterialUiRadioInputs />
    </div>
  );
}

export default RadioInputs;
