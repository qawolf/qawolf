import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import React from 'react';
import Argument from '../Argument';

function ArgumentCreate() {
  return (
    <React.Fragment>
      <Argument
        description={<React.Fragment>Create options.</React.Fragment>}
        name="options"
        optional
        type="Object"
      />
      <Argument
        description={
          <React.Fragment>
            File where new code will be inserted. <b>Default:</b> file where{' '}
            <code>create</code> was called.
          </React.Fragment>
        }
        indent
        name="codePath"
        optional
        type="string"
      />
      <Argument
        description={
          <React.Fragment>
            <a href="https://github.com/microsoft/playwright/blob/master/docs/api.md#class-browsercontext">
              Playwright <code>BrowserContext</code>
            </a>{' '}
            instance where your actions will be converted to code. Must either
            call{' '}
            <Link to={useBaseUrl('docs/api/qawolf/register')}>
              <code>register(context)</code>
            </Link>{' '}
            before calling <code>create</code> or pass this option.{' '}
            <b>Default:</b> existing <code>BrowserContext</code> instance.
          </React.Fragment>
        }
        indent
        name="context"
        optional
        type="BrowserContext"
      />
      <Argument
        description={
          <React.Fragment>
            File where element selectors should be saved. <b>Default:</b>{' '}
            Inferred from file where code will be created.
          </React.Fragment>
        }
        indent
        name="selectorPath"
        optional
        type="string"
      />
    </React.Fragment>
  );
}

export default ArgumentCreate;
