import React from "react";

const buttonImage =
  "data:image/png;base64,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";

function HtmlButtons() {
  const inputButtonsStyle = {
    alignItems: "end",
    display: "inline-flex",
    justifyContent: "space-between",
    width: 380,
  };

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
      <button id="whitespace-button">{"     I have extra whitespace  "}</button>
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
      <button>
        <span data-for-test="selection">Better attribute on span</span>
      </button>
      <br />
      <br />
      <button type="button">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="10"
          height="10"
          style={{ marginRight: 6 }}
        >
          <circle
            cx="5"
            cy="5"
            r="5"
            stroke="black"
            strokeWidth="0"
            fill="red"
          ></circle>
        </svg>
        <span>SVG text button</span>
      </button>
      <br />
      <br />
      <button
        data-for-test="nested-svg"
        type="button"
        style={{ display: "inline-flex", alignItems: "center" }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="10"
          height="10"
          style={{ marginRight: 6 }}
        >
          <circle
            cx="5"
            cy="5"
            r="5"
            stroke="black"
            strokeWidth="0"
            fill="red"
          ></circle>
        </svg>
        <div>
          <span>Nested SVG text button</span>
        </div>
      </button>
      <br />
      <br />
      <button
        data-for-test="nested-svg-with-nested-link"
        type="button"
        style={{ display: "inline-flex", alignItems: "center" }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="10"
          height="10"
          style={{ marginRight: 6 }}
        >
          <circle
            cx="5"
            cy="5"
            r="5"
            stroke="black"
            strokeWidth="0"
            fill="red"
          ></circle>
        </svg>
        <div>
          <span>Nested SVG text button&nbsp;</span>
        </div>
        <a href="#top">
          <span>with nested link</span>
        </a>
      </button>
      <br />
      <br />
      <div style={inputButtonsStyle}>
        <input id="submit-input" type="submit" value="Submit Input" />
        <input id="button-input" type="button" value="Button Input" />
        <input
          id="image-input"
          type="image"
          src={buttonImage}
          alt="Play"
          width="30"
        />
        <input id="reset-input" type="reset" value="Reset Input" />
      </div>
      <br />
      <br />
      <button data-qa="reload-top" onClick={() => window.top.location.reload()}>
        Reload Top
      </button>
    </div>
  );
}

export default HtmlButtons;
