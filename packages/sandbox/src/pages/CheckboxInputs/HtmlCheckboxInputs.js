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
      <input className="special:class" id="special:id" type="checkbox" />
      <label htmlFor="special:id"> Another checkbox</label>
      <br />
      <input id="sadovh89r" type="checkbox" name="nonDynamicInput" />
      <label htmlFor="sadovh89r"> Checkbox with non-dynamic name</label>
      <br />
      <input id="b98joifbon" type="checkbox" name="bu32879fDi" />
      <label htmlFor="b98joifbon"> Checkbox with dynamic name</label>
      <br />
      <input id="v9eonirh894" type="checkbox" name="input-bu32879fDi" />
      <label htmlFor="v9eonirh894"> Checkbox with dynamic ending of name</label>
      <br />
      <input id="ern84j8g0" type="checkbox" name="bu32879fDi-check" />
      <label htmlFor="ern84j8g0"> Checkbox with dynamic beginning of name</label>
      <br />
      <input id="fdg8e9v4" type="checkbox" name="f89ndrn4-blue-5" />
      <label htmlFor="fdg8e9v4"> Checkbox with dynamic beginning and ending of name</label>
      <br />
      <input id="y908drgun4" type="checkbox" name="" />
      <label htmlFor="y908drgun4"> Checkbox with empty name</label>
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
