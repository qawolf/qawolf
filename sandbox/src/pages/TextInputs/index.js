import React from "react";
import HtmlTextInputs from "./HtmlTextInputs";
import MaterialUiTextInputs from "./MaterialUiTextInputs";

function TextInputs() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap" }}>
      <HtmlTextInputs />
      <MaterialUiTextInputs />
    </div>
  );
}

export default TextInputs;
