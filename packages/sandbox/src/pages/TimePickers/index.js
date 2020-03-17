import React from "react";
import HtmlTimePickers from "./HtmlTimePickers";
import MaterialUiTimePickers from "./MaterialUiTimePickers";

function TimePickers() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap" }}>
      <HtmlTimePickers />
      <MaterialUiTimePickers />
    </div>
  );
}

export default TimePickers;
