import { useContext } from "react";

import { copy } from "../../theme/copy";
import { UserContext } from "../UserContext";
import CodeBlock from "./CodeBlock";

export default function CliExample(): JSX.Element {
  const { team } = useContext(UserContext);

  const apiKey = team?.api_key || copy.apiKeyHere;

  return (
    <>
      <p>
        The command runs all of your tests with the QA Wolf CLI. If you are
        logged in, your team's API key is included in the example:
      </p>
      <CodeBlock
        className="language-bash"
        style={{ whiteSpace: "break-spaces" }}
      >{`QAWOLF_API_KEY=${apiKey} npx qawolf test`}</CodeBlock>
      <p>
        You can optionally filter tests by tags, choose the environment, and
        provide additional environment variables:
      </p>
      <CodeBlock
        className="language-bash"
        style={{ whiteSpace: "break-spaces" }}
      >{`QAWOLF_API_KEY=${apiKey} npx qawolf test --tags 'Sign up,Checkout' --environment 'Staging'  --variables '{ "MY_VARIABLE": "secret" }'`}</CodeBlock>
    </>
  );
}
