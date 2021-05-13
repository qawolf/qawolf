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
        The API call below runs all of your tests. If you are logged in, your
        team's API key is included in the example:
      </p>
      <CodeBlock
        className="language-bash"
        style={{ whiteSpace: "break-spaces" }}
      >{`curl -H "Authorization: ${apiKey}" -H "Content-Type: application/json" ${apiUrl}`}</CodeBlock>
      <p>
        You can optionally filter tests by tags, choose the environment, and
        provide additional environment variables:
      </p>
      <CodeBlock
        className="language-bash"
        style={{ whiteSpace: "break-spaces" }}
      >{`curl -H "Authorization: ${apiKey}" -H "Content-Type: application/json" ${apiUrl} -d '{"tags": "Checkout,Sign up", "environment": "Staging", "variables": { "MY_VARIABLE": "secret" }}'`}</CodeBlock>
    </>
  );
}
