import React from 'react';
import Argument from '../Argument';

function ReturnPage() {
  return (
    <Argument
      description={
        <React.Fragment>
          Resolves to a{' '}
          <a href="https://github.com/microsoft/playwright/blob/master/docs/api.md#class-page">
            Playwright <code>Page</code>
          </a>{' '}
          instance.
        </React.Fragment>
      }
      name=""
      type="Promise<Page>"
    />
  );
}

export default ReturnPage;
