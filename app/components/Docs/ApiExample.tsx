import { useContext } from "react";

import { isServer } from "../../lib/detection";
import { copy } from "../../theme/copy";
import { UserContext } from "../UserContext";
import CodeBlock from "./CodeBlock";

export default function ApiExample(): JSX.Element {
  const { team } = useContext(UserContext);

  const apiKey = team?.api_key || copy.apiKeyHere;
  const url = isServer() ? "https://www.qawolf.com" : window.location.origin;
  const apiUrl = new URL("/api/suites", url).href;

  return (
    <>
      <p>
        You can run your tests by calling the QA Wolf API. Use the command below
        to run all of your tests:
      </p>
      <CodeBlock
        className="language-bash"
        style={{ whiteSpace: "break-spaces" }}
      >{`curl -H "Authorization: ${apiKey}" -H "Content-Type: application/json" ${apiUrl}`}</CodeBlock>
      <p>
        You can also optionally specify environment variables, an environment
        name, and test tags:
      </p>
      <CodeBlock
        className="language-bash"
        style={{ whiteSpace: "break-spaces" }}
      >{`curl -H "Authorization: ${apiKey}" -H "Content-Type: application/json" ${apiUrl} -d '{"env": { "MY_VARIABLE": "secret" }, "env_name": "Staging", "tags": "Checkout,Sign up"}'`}</CodeBlock>
    </>
  );
}
