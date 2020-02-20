import React from "react";
import HtmlButtons from "./HtmlButtons";
import MaterialUiButtons from "./MaterialUiButtons";

function Buttons() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap" }}>
      <HtmlButtons />
      <MaterialUiButtons />
    </div>
  );
}

export default Buttons;
