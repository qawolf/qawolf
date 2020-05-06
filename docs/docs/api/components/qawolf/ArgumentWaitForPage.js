import React from 'react';
import Argument from '../Argument';

function ArgumentWaitForPage() {
  return (
    <React.Fragment>
      <Argument
        description={
          <React.Fragment>
            The{' '}
            <a href="https://github.com/microsoft/playwright/blob/master/docs/api.md#class-browsercontext">
              Playwright <code>BrowserContext</code>
            </a>{' '}
            instance to load the page from.
          </React.Fragment>
        }
        name="context"
        type="BrowserContext"
      />
      <Argument
        description={
          <React.Fragment>
            The index of the page, starting at <code>0</code>.
          </React.Fragment>
        }
        name="index"
        type="number"
      />
      <Argument
        description="Wait for page options."
        name="options"
        optional
        type="Object"
      />
      <Argument
        description={
          <React.Fragment>
            Maximum time in milliseconds to wait for the page. <b>Default:</b>{' '}
            <code>30000</code>.
          </React.Fragment>
        }
        name="timeout"
        indent
        optional
        type="number"
      />
      <Argument
        description={
          <React.Fragment>
            When to consider navigation on the page over. <b>Default:</b>{' '}
            <code>"load"</code>.
          </React.Fragment>
        }
        indent
        name="waitUntil"
        optional
        type='"load" | "domcontentloaded" | "networkidle"'
      />
    </React.Fragment>
  );
}

export default ArgumentWaitForPage;
