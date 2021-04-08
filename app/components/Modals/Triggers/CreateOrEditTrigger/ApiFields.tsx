import { Box } from "grommet";

import { useApiKey } from "../../../../hooks/apiKey";
import { isServer } from "../../../../lib/detection";
import { routes } from "../../../../lib/routes";
import { copy } from "../../../../theme/copy";
import CodeBlock from "../../../shared/CodeBlock";
import ExternalLink, {
  buildQaWolfDocsLink,
} from "../../../shared/ExternalLink";
import Text from "../../../shared/Text";
import { labelTextProps } from "../helpers";

type Props = { editTriggerId?: string };

const boxProps = {
  align: "center" as const,
  direction: "row" as const,
  margin: labelTextProps.margin,
};

const textProps = { ...labelTextProps, margin: "0" };

export default function ApiFields({ editTriggerId }: Props): JSX.Element {
  const { apiKey, team } = useApiKey();
  const triggerId = editTriggerId || team?.next_trigger_id || copy.triggerId;

  const apiCall = `curl -H "Authorization: ${apiKey}" -H "Content-Type: application/json" https://www.qawolf.com/api/suites -d '{"env": { "MY_VARIABLE": "secret" }, "trigger_id": "${triggerId}"}'`;
  const apiDocsHref = buildQaWolfDocsLink("/run-tests-with-api");

  const cliCall = `npx qawolf test --trigger ${triggerId} --env '{"env": { "MY_VARIABLE": "secret" } }'`;
  const cliDocsHref = buildQaWolfDocsLink("/run-tests-with-cli");

  return (
    <>
      <Box {...boxProps}>
        <Text {...textProps} margin={{ right: "xxxsmall" }} size="component">
          {copy.apiDetail}
        </Text>
        <ExternalLink href={apiDocsHref}>{copy.apiDetail2}</ExternalLink>{" "}
        <Text {...textProps} size="component">
          :
        </Text>
      </Box>
      <CodeBlock>{apiCall}</CodeBlock>
      <Box {...boxProps}>
        <Text {...textProps} margin={{ right: "xxxsmall" }} size="component">
          {copy.cliDetail}
        </Text>
        <ExternalLink href={cliDocsHref}>{copy.cliDetail2}</ExternalLink>{" "}
        <Text {...textProps} size="component">
          :
        </Text>
      </Box>
      <CodeBlock>{cliCall}</CodeBlock>
    </>
  );
}
