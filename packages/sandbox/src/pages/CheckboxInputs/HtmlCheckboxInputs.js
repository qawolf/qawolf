import React, { useState } from 'react';

function HtmlCheckboxInputs() {
  const [isChecked, setIsChecked] = useState(false);
  const hiddenLabelColor = isChecked ? 'green' : 'red';

  return (
    <div className="container">
      <h3>Native HTML</h3>
      <input data-qa="html-checkbox" id="single" type="checkbox" />
      <label htmlFor="single"> Single checkbox</label>
      <br />
      <input id="another" type="checkbox" />
      <label htmlFor="another"> Another checkbox</label>
      <br />
      <input
        checked={isChecked}
        data-qa="html-checkbox-hidden"
        id="hidden"
        onChange={() => setIsChecked((prev) => !prev)}
        style={{ display: 'none' }}
        type="checkbox"
      />
      <label
        data-qa="html-checkbox-hidden-label"
        htmlFor="hidden"
        style={{ color: hiddenLabelColor }}
      >
        {' '}
        Hidden input
      </label>
      <h4>Best pet?</h4>
      <fieldset data-qa="html-checkbox-group">
        <input type="checkbox" id="cat" name="pet" qa-input="cat" value="cat" />
        <label htmlFor="cat"> Cat</label>
        <br />
        <input type="checkbox" id="dog" name="pet" value="dog" />
        <label htmlFor="dog"> Dog</label>
        <br />
        <input type="checkbox" id="hedgehog" name="pet" value="hedgehog" />
        <label htmlFor="hedgehog"> Hedgehog</label>
        <br />
      </fieldset>
    </div>
  );
}

export default HtmlCheckboxInputs;
