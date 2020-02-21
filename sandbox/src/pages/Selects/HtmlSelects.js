import React from "react";

function HtmlSelects() {
  return (
    <div className="container">
      <h3>Native HTML</h3>
      <select data-qa="html-select" defaultValue="">
        <option disabled value="">
          Best pet?
        </option>
        <option value="cat">Cat</option>
        <option value="dog">Dog</option>
        <option value="hedgehog">Hedgehog</option>
        <option disabled value="snake">
          Snake
        </option>
      </select>
    </div>
  );
}

export default HtmlSelects;
