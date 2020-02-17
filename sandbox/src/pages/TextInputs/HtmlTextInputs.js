import React, { useState } from "react";

function HtmlTextInputs() {
  const [value, setValue] = useState("initial value");

  return (
    <React.Fragment>
      <div className="container">
        <h3>Native HTML</h3>
        <input data-qa="html-text-input" placeholder="Text input" type="text" />
        <br />
        <br />
        <input
          data-qa="html-text-input-filled"
          onChange={e => setValue(e.target.value)}
          placeholder="Filled text input"
          type="text"
          value={value}
        />
        <br />
        <br />
        <input
          data-qa="html-password-input"
          placeholder="Password input"
          type="password"
        />
        <br />
        <br />
        <input
          data-qa="html-number-input"
          placeholder="Number input"
          type="number"
        />
        <br />
        <br />
        <textarea data-qa="html-textarea" placeholder="Textarea" />
      </div>
    </React.Fragment>
  );
}

export default HtmlTextInputs;
