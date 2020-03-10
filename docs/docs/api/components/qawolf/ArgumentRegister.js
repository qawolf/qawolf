import React from 'react';
import Argument from '../Argument';

function ArgumentRegister() {
  return (
    <React.Fragment>
      <Argument
        description={
          <React.Fragment>
            The{' '}
            <a href="https://github.com/microsoft/playwright/blob/master/docs/api.md#class-browsercontext">
              Playwright <code>BrowserContext</code>
            </a>{' '}
            instance.
          </React.Fragment>
        }
        name="context"
        type="BrowserContext"
      />
    </React.Fragment>
  );
}

export default ArgumentRegister;
