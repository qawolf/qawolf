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
      <button className="btn-a btn-1">Classes</button>
      <button className="btn-a btn-2">Classes</button>
      <button className="btn-b btn-1">Classes</button>
      <button className="btn-b btn-2">Classes</button>
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
