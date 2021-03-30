import { useApiKey } from "../../../../hooks/apiKey";
import { copy } from "../../../../theme/copy";
import CodeBlock from "../../../shared/CodeBlock";
import ExternalLink from "../../../shared/ExternalLink";
import Text from "../../../shared/Text";
import { labelTextProps } from "../helpers";

const pluginHref = "https://app.netlify.com/plugins"; // TODO: update
const variablesHref =
  "https://docs.netlify.com/configure-builds/environment-variables/#declare-variables";

export default function NetlifyBuildPlugin(): JSX.Element {
  const { apiKey } = useApiKey();

  return (
    <>
      <Text {...labelTextProps}>{copy.setUp}</Text>
      <ExternalLink href={pluginHref}>{copy.netlifyBuildPlugin}</ExternalLink>
      <ExternalLink href={variablesHref} margin={{ vertical: "small" }}>
        {copy.netlifyBuildVariable}
      </ExternalLink>
      <CodeBlock>{apiKey}</CodeBlock>
    </>
  );
}
