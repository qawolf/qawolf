import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import React from "react";
import Argument from "./Argument";

function ArgumentFindElementOptions({ delayMs, replace, simulate }) {
  return (
    <React.Fragment>
      <Argument
        description="Options to use when finding the element."
        name="options"
        optional
        type="Object"
      />
      {!!delayMs && (
        <Argument
          description={
            <React.Fragment>
              Time in milliseconds to wait between key presses. <b>Default:</b>{" "}
              <code>300</code> for <code>↓</code>
              <a href="https://github.com/microsoft/playwright/blob/master/docs/api.md#keyboarddownkey-options">
                keyboard.down
              </a>{" "}
              and <code>↑</code>
              <a href="https://github.com/microsoft/playwright/blob/master/docs/api.md#keyboardupkey">
                keyboard.up
              </a>
              , <code>0</code> for <code>→</code>
              <a href="https://github.com/microsoft/playwright/blob/master/docs/api.md#keyboardsendcharacterstext">
                keyboard.sendCharacters
              </a>
              .
            </React.Fragment>
          }
          indent
          name="delayMs"
          optional
          type="number"
        />
      )}
      <Argument
        description={
          <React.Fragment>
            The index of the page that contains the element, starting at{" "}
            <code>0</code> and ordered by creation. <b>Default:</b> last used
            page index.
          </React.Fragment>
        }
        indent
        name="page"
        optional
        type="number"
      />
      {!!replace && (
        <Argument
          description={
            <React.Fragment>
              Clear the value of the input before typing. <b>Default:</b>{" "}
              <code>false</code>.
            </React.Fragment>
          }
          indent
          name="replace"
          optional
          type="boolean"
        />
      )}
      {!!simulate && (
        <Argument
          description={
            <React.Fragment>
              Simulate the click by dispatching a{" "}
              <a href="https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent">
                MouseEvent
              </a>
              . If set to <code>false</code>,{" "}
              <a href="https://github.com/microsoft/playwright/blob/master/docs/api.md#pageclickselector-options">
                Playwright's Page.click
              </a>{" "}
              is called. <b>Default:</b> <code>false</code>.
            </React.Fragment>
          }
          indent
          name="simulate"
          optional
          type="boolean"
        />
      )}
      <Argument
        description={
          <React.Fragment>
            Sleep after finding the element for this amount of time in
            milliseconds. <b>Default:</b>{" "}
            <Link
              to={useBaseUrl("docs/api/environment_variables#qaw_sleep_ms")}
            >
              <code>QAW_SLEEP_MS</code>
            </Link>
            .
          </React.Fragment>
        }
        indent
        name="sleepMs"
        optional
        type="number"
      />
      <Argument
        description={
          <React.Fragment>
            Maximum amount of time in milliseconds to wait for the element.{" "}
            <b>Default:</b>{" "}
            <Link
              to={useBaseUrl("docs/api/environment_variables#qaw_timeout_ms")}
            >
              <code>QAW_TIMEOUT_MS</code>
            </Link>
            .
          </React.Fragment>
        }
        indent
        name="timeoutMs"
        optional
        type="number"
      />
      <Argument
        description={
          <React.Fragment>
            Wait until the page completes all network requests (up to 10 seconds
            per request). <b>Default:</b> <code>true</code>.
          </React.Fragment>
        }
        indent
        name="waitForRequests"
        optional
        type="boolean"
      />
    </React.Fragment>
  );
}

export default ArgumentFindElementOptions;
