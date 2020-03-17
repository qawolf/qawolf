import React from "react";
import HtmlDatePickers from "./HtmlDatePickers";
import MaterialUiDatePickers from "./MaterialUiDatePickers";

function DatePickers() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap" }}>
      <HtmlDatePickers />
      <MaterialUiDatePickers />
    </div>
  );
}

export default DatePickers;
