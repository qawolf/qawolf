import React from "react";
import HtmlCheckboxInputs from "./HtmlCheckboxInputs";
import MaterialUiCheckboxInputs from "./MaterialUiCheckboxInputs";

function CheckboxInputs() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap" }}>
      <HtmlCheckboxInputs />
      <MaterialUiCheckboxInputs />
    </div>
  );
}

export default CheckboxInputs;
