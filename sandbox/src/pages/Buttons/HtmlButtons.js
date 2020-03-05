import React from "react";

function HtmlButtons() {
  return (
    <div className="container">
      <h3>Native HTML</h3>
      <button id="html-button">Sign in</button>
      <br />
      <br />
      <button data-qa="html-button">Submit</button>
      <br />
      <br />
      <button data-qa="html-button-with-children">
        <div>
          <p id="html-button-child">Click me!</p>
        </div>
      </button>
    </div>
  );
}

export default HtmlButtons;
