import React from "react";
import HtmlSelects from "./HtmlSelects";
import MaterialUiSelects from "./MaterialUiSelects";

function Selects() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap" }}>
      <HtmlSelects />
      <MaterialUiSelects />
    </div>
  );
}

export default Selects;
