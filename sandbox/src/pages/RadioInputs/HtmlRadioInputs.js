import React from "react";

function HtmlRadioInputs() {
  return (
    <div className="container">
      <h3>Native HTML</h3>
      <input data-qa="html-radio" id="single" type="radio" />
      <label htmlFor="single"> Single radio button</label>
      <br />
      <input id="another" type="radio" />
      <label htmlFor="another"> Another radio button</label>
      <h4>Best pet?</h4>
      <fieldset data-qa="html-radio-group">
        <input type="radio" id="cat" name="pet" value="cat" />
        <label htmlFor="cat"> Cat</label>
        <br />
        <input type="radio" id="dog" name="pet" value="dog" />
        <label htmlFor="dog"> Dog</label>
        <br />
        <input type="radio" id="hedgehog" name="pet" value="hedgehog" />
        <label htmlFor="hedgehog"> Hedgehog</label>
        <br />
      </fieldset>
    </div>
  );
}

export default HtmlRadioInputs;
