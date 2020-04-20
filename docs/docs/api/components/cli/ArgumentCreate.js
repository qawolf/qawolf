import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import React from 'react';
import Argument from '../Argument';

function ArgumentCreate() {
  return (
    <React.Fragment>
      <Argument
        description={
          <React.Fragment>
            Emulate a{' '}
            <a href="https://github.com/Microsoft/playwright/blob/master/src/deviceDescriptors.ts">
              supported device
            </a>
            . See{' '}
            <Link to={useBaseUrl('docs/emulate_a_device')}>this guide</Link> to
            learn more. <b>Default:</b> No device emulation.
          </React.Fragment>
        }
        name="--device name"
        optional
        type="string"
      />
      <Argument
        description={
          <React.Fragment>
            File where{' '}
            <Link to={useBaseUrl('docs/handle_sign_in')}>state data</Link>{' '}
            (cookies, <code>localStorage</code>, <code>sessionStorage</code>) is
            saved. If provided, the state will be set before you create your
            test. <b>Default:</b> <code>null</code>.
          </React.Fragment>
        }
        name="--statePath file"
        optional
        type="string"
      />
      <Argument
        description="Visit this URL to begin your test."
        name="url"
        type="string"
      />
      <Argument
        description={
          <React.Fragment>
            The name of your test file. The file will be saved at{' '}
            <code>{'${rootDir}/${name}.test.js'}</code>. <b>Default:</b> the
            hostname of the provided URL.
          </React.Fragment>
        }
        name="name"
        optional
        type="string"
      />
    </React.Fragment>
  );
}

export default ArgumentCreate;
