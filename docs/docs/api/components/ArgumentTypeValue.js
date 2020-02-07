import React from "react";
import Argument from "./Argument";

function ArgumentTypeValue() {
  return (
    <Argument
      description={
        <React.Fragment>
          Type this value. To clear the element, pass <code>null</code> as the
          value. Specify a sequence of keystrokes by prefixing the key with the
          direction. Use <code>↓</code> for{" "}
          <a href="https://github.com/microsoft/playwright/blob/master/docs/api.md#keyboarddownkey-options">
            keyboard.down
          </a>
          , <code>↑</code> for{" "}
          <a href="https://github.com/microsoft/playwright/blob/master/docs/api.md#keyboardupkey">
            keyboard.up
          </a>
          , and <code>→</code> for{" "}
          <a href="https://github.com/microsoft/playwright/blob/master/docs/api.md#keyboardsendcharacterstext">
            keyboard.sendCharacters
          </a>
          . Useful for testing hot keys.
        </React.Fragment>
      }
      name="value"
      type="string | null"
    />
  );
}

export default ArgumentTypeValue;
