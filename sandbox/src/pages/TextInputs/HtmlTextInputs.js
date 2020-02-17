import React from "react";

function HtmlTextInputs() {
  return (
    <div className="container">
      <h3>Native HTML</h3>
      <input data-qa="html-text-input" placeholder="Text input" type="text" />
      <br />
      <br />
      <input
        data-qa="html-text-input-filled"
        defaultValue="initial text"
        placeholder="Filled text input"
        type="text"
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
  );
}

export default HtmlTextInputs;
