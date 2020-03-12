import React from 'react';
import Argument from '../Argument';

function ArgumentAllBrowsers() {
  return (
    <React.Fragment>
      <Argument
        description={
          <React.Fragment>
            Run your test(s) on{' '}
            <a href="https://www.chromium.org/Home">Chromium</a>,{' '}
            <a href="https://www.mozilla.org/en-US/firefox/new">Firefox</a>, and{' '}
            <a href="https://webkit.org">WebKit</a>.
          </React.Fragment>
        }
        name="--all-browsers"
        optional
        type="boolean"
      />
    </React.Fragment>
  );
}

export default ArgumentAllBrowsers;
