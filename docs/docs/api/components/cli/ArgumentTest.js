import React from 'react';
import Argument from '../Argument';
import ArgumentAllBrowsers from './ArgumentAllBrowsers';
import ArgumentFirefox from './ArgumentFirefox';
import ArgumentWebKit from './ArgumentWebKit';

function ArgumentTest() {
  return (
    <React.Fragment>
      <ArgumentAllBrowsers />
      <ArgumentFirefox />
      <ArgumentWebKit />
      <Argument
        description={
          <React.Fragment>
            The name of the test file to run. For example, passing{' '}
            <code>myTestName</code> will run the{' '}
            <code>{'${rootDir}/tests/myTestName.test.js'}</code> file.{' '}
            <b>Default:</b> run all tests.
          </React.Fragment>
        }
        name="name"
        optional
        type="string"
      />
      <Argument
        description={
          <React.Fragment>
            Options for the <a href="https://jestjs.io/docs/en/cli">Jest CLI</a>
            .
          </React.Fragment>
        }
        name="...jestOptions"
        optional
        type="Jest CLI Options"
      />
    </React.Fragment>
  );
}

export default ArgumentTest;
