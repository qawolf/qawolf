import React from 'react';

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
      <br />
      <br />
      <button className="quote-button">Button "with" extra 'quotes'</button>
      <br />
      <br />
      <button id="whitespace-button">{'     I have extra whitespace  '}</button>
      <br />
      <br />
      <button className="first-half type-one">Classes</button>
      <button className="first-half type-two">Classes</button>
      <button className="second-half type-one">Classes</button>
      <button className="second-half type-two">Classes</button>
      <br />
      <br />
      <button id="nested">
        <div>
          <span>Nested</span>
        </div>
      </button>
      <button>
        <div data-qa="nested-attribute">
          <span>Nested Attribute</span>
        </div>
      </button>
      <br />
      <br />
      <input id="submit-input" type="submit" value="Submit Input" />
    </div>
  );
}

export default HtmlButtons;
