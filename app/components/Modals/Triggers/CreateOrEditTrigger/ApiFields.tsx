import { useApiKey } from "../../../../hooks/apiKey";
import { copy } from "../../../../theme/copy";
import CodeBlock from "../../../shared/CodeBlock";
import Text from "../../../shared/Text";
import { labelTextProps } from "../helpers";

type Props = { editTriggerId?: string };

export default function ApiFields({ editTriggerId }: Props): JSX.Element {
  const { apiKey, team } = useApiKey();
  const triggerId = editTriggerId || team?.next_trigger_id || copy.triggerId;

  const apiCall = `curl -H "Authorization: ${apiKey}" -H "Content-Type: application/json" https://www.qawolf.com/api/suites -d '{"env": { "MY_VARIABLE": "secret" }, "trigger_id": "${triggerId}"}'`;

  return (
    <>
      <Text {...labelTextProps} size="component">
        {copy.apiDetail}
      </Text>
      <CodeBlock>{apiCall}</CodeBlock>
    </>
  );
}
