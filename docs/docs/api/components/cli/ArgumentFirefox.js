import React from 'react';
import Argument from '../Argument';

function ArgumentFirefox() {
  return (
    <React.Fragment>
      <Argument
        description={
          <React.Fragment>
            Run your test(s) on{' '}
            <a href="https://www.mozilla.org/en-US/firefox/new">Firefox</a>.
          </React.Fragment>
        }
        name="--firefox"
        optional
        type="boolean"
      />
    </React.Fragment>
  );
}

export default ArgumentFirefox;
