import React from 'react';
import Argument from '../Argument';

function ArgumentSaveState({ isSaved }) {
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
        description={
          <React.Fragment>
            The path where the state {isSaved ? 'is' : 'will be'} saved as{' '}
            <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON">
              JSON
            </a>
            .
          </React.Fragment>
        }
        name="savePath"
        type="string"
      />
    </React.Fragment>
  );
}

export default ArgumentSaveState;
