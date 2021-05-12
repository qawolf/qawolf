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
        You can run your tests with the QA Wolf CLI. Use the command below to
        run all of your tests:
      </p>
      <CodeBlock
        className="language-bash"
        style={{ whiteSpace: "break-spaces" }}
      >{`QAWOLF_API_KEY=${apiKey} npx qawolf test`}</CodeBlock>
      <p>
        You can also optionally specify environment variables, an environment
        name, and test tags:
      </p>
      <CodeBlock
        className="language-bash"
        style={{ whiteSpace: "break-spaces" }}
      >{`QAWOLF_API_KEY=${apiKey} npx qawolf test --env '{ "MY_VARIABLE": "secret" }' --env_name 'Staging' --tags 'Sign up,Checkout'`}</CodeBlock>
    </>
  );
}
