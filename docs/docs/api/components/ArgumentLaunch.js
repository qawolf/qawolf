import React from 'react';
import Argument from './Argument';

function ArgumentLaunch() {
  return (
    <React.Fragment>
      <Argument
        description={
          <React.Fragment>
            Launch options, which extends{' '}
            <a href="https://github.com/microsoft/playwright/blob/master/docs/api.md#browsertypelaunchoptions">
              Playwright <code>browserType.launch</code> options
            </a>
            .
          </React.Fragment>
        }
        name="options"
        optional
        type="Object"
      />
      <Argument
        description={
          <React.Fragment>
            Launch this type of browser. <b>Default:</b> <code>"chromium"</code>
            .
          </React.Fragment>
        }
        indent
        name="browserName"
        optional
        type='"chromium" | "firefox" | "webkit"'
      />
    </React.Fragment>
  );
}

export default ArgumentLaunch;
