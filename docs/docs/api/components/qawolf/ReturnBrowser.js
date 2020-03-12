import React from 'react';
import Argument from '../Argument';

function ReturnBrowser() {
  return (
    <Argument
      description={
        <React.Fragment>
          Resolves to a{' '}
          <a href="https://github.com/microsoft/playwright/blob/master/docs/api.md#class-browser">
            Playwright <code>Browser</code>
          </a>{' '}
          instance.
        </React.Fragment>
      }
      name=""
      type="Promise<Browser>"
    />
  );
}

export default ReturnBrowser;
