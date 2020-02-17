import React from "react";
import HtmlSelects from "./HtmlSelects";
import MaterialUiSelects from "./MaterialUiSelects";
import SemanticUiSelects from "./SemanticUiSelects";

function Selects() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap" }}>
      <HtmlSelects />
      <MaterialUiSelects />
      <SemanticUiSelects />
    </div>
  );
}

export default Selects;
