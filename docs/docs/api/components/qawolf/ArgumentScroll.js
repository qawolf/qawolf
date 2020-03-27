import React from 'react';
import Argument from '../Argument';

function ArgumentScroll() {
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
        description="Selector of the element to scroll."
        name="selector"
        type="string"
      />
      <Argument description="Scroll options." name="options" type="Object" />
      <Argument
        description="Horizontal position to scroll element to in pixels."
        indent
        name="x"
        type="number"
      />
      <Argument
        description="Vertical position to scroll element to in pixels."
        indent
        name="y"
        type="number"
      />
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

export default ArgumentScroll;
