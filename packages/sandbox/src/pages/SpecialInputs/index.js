import React from "react";

function SpecialInputs() {
  return (
    <div className="container">
      <h3>Native HTML</h3>
      <h4>Color</h4>
      <input data-qa="html-color-picker" type="color" />
      <h4>Range</h4>
      <input data-qa="html-range-picker" type="range" min="0" max="10" />
    </div>
  );
}

export default SpecialInputs;
