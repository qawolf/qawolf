import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import React from 'react';
import Argument from './Argument';

function ArgumentCreateTemplate() {
  return (
    <React.Fragment>
      <Argument
        description={
          <React.Fragment>
            The{' '}
            <a href="https://github.com/Microsoft/playwright/blob/master/src/deviceDescriptors.ts">
              Playwright <code>device</code>
            </a>{' '}
            to emulate.
          </React.Fragment>
        }
        name="device"
        optional
        type="string"
      />
      <Argument description="The name of the test." name="name" type="string" />
      <Argument
        description={
          <React.Fragment>
            The path where the{' '}
            <Link to={useBaseUrl('docs/handle_sign_in')}>user state</Link> is
            saved.
          </React.Fragment>
        }
        name="statePath"
        optional
        type="string"
      />
      <Argument
        description="Visit this URL to begin the test."
        name="url"
        type="string"
      />
      <Argument
        description="Whether the test should be in TypeScript."
        optional
        name="useTypeScript"
        type="boolean"
      />
    </React.Fragment>
  );
}

export default ArgumentCreateTemplate;
