import React from 'react';
import Argument from '../Argument';

function ArgumentWebKit() {
  return (
    <React.Fragment>
      <Argument
        description={
          <React.Fragment>
            Run your test(s) on <a href="https://webkit.org">WebKit</a>.
          </React.Fragment>
        }
        name="--webkit"
        optional
        type="boolean"
      />
    </React.Fragment>
  );
}

export default ArgumentWebKit;
