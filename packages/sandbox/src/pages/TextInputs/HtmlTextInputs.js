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
      <input data-qa="html-search-input" placeholder="Search input" type="search" />
      <br />
      <br />
      <input data-qa="html-email-input" placeholder="Email input" type="email" />
      <br />
      <br />
      <input data-qa="html-url-input" placeholder="URL input" type="url" />
      <br />
      <br />
      <input data-qa="html-tel-input" placeholder="Telephone input" type="tel" />
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
      <br />
      <br />
      <h4>Edge Cases</h4>
      <input
        contenteditable="true"
        data-qa="html-text-input-content-editable"
        placeholder="Content editable text input"
        type="text"
      />
    </div>
  );
}

export default HtmlTextInputs;
