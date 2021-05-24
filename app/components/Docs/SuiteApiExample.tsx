import { useContext } from "react";

import { isServer } from "../../lib/detection";
import { copy } from "../../theme/copy";
import { UserContext } from "../UserContext";
import CodeBlock from "./CodeBlock";

export default function SuiteApiExample(): JSX.Element {
  const { team } = useContext(UserContext);

  const apiKey = team?.api_key || copy.apiKeyHere;
  const url = isServer() ? "https://www.qawolf.com" : window.location.origin;
  const apiUrl = new URL("/api/suite/:id", url).href;

  return (
    <CodeBlock
      className="language-bash"
      style={{ whiteSpace: "break-spaces" }}
    >{`curl -H "Authorization: ${apiKey}" ${apiUrl}`}</CodeBlock>
  );
}
