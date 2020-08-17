import React from 'react';
import Argument from '../Argument';

function ArgumentAssertElementText() {
  return (
    <React.Fragment>
      <Argument
        description={
          <React.Fragment>
            The{' '}
            <a href="https://github.com/microsoft/playwright/blob/master/docs/api.md#class-page">
              Playwright <code>Page</code>
            </a>{' '}
            instance.
          </React.Fragment>
        }
        name="page"
        type="Page"
      />
      <Argument
        description="Selector of the element that should contain the text."
        name="selector"
        type="string"
      />
      <Argument description="Text to be asserted." name="text" type="string" />
      <Argument name="options" type="Object" />
      <Argument
        description={
          <React.Fragment>
            Maximum time in milliseconds to wait for element to reach specified
            scroll position. <b>Default:</b> <code>30000</code>.
          </React.Fragment>
        }
        indent
        name="timeout"
        optional
        type="number"
      />
    </React.Fragment>
  );
}

export default ArgumentAssertElementText;
