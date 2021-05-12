import { useContext } from "react";

import { copy } from "../../theme/copy";
import { UserContext } from "../UserContext";
import CodeBlock from "./CodeBlock";

export default function CliApiKeyExample(): JSX.Element {
  const { team } = useContext(UserContext);

  const apiKey = team?.api_key || copy.apiKeyHere;

  return (
    <>
      <p>
        Note that you also need to set the <code>QAWOLF_API_KEY</code>{" "}
        environment variable before running tests with the CLI:
      </p>
      <CodeBlock
        className="language-bash"
        style={{ whiteSpace: "break-spaces" }}
      >{`export QAWOLF_API_KEY=${apiKey} # set API key`}</CodeBlock>
    </>
  );
}
