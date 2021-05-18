import { Box } from "grommet";

import { useApiKey } from "../../../../hooks/apiKey";
import { copy } from "../../../../theme/copy";
import CodeBlock from "../../../shared/CodeBlock";
import Link, { buildQaWolfDocsLink } from "../../../shared/Link";
import Text from "../../../shared/Text";
import { labelTextProps } from "../helpers";

const pluginHref =
  "https://app.netlify.com/plugins/netlify-plugin-qawolf/install";
const variablesHref =
  "https://docs.netlify.com/configure-builds/environment-variables/#declare-variables";

export default function NetlifyBuildPlugin(): JSX.Element {
  const apiKey = useApiKey();

  const docsHref = buildQaWolfDocsLink(
    "/run-tests-on-netlify-deployment#install-qa-wolf-build-plugin"
  );

  return (
    <>
      <Box align="center" direction="row">
        <Text
          {...labelTextProps}
          margin={{ ...labelTextProps.margin, right: "xxsmall" }}
        >
          {copy.setUp}
        </Text>
        <Link isBold href={docsHref} margin={labelTextProps.margin} newTab>
          {`(${copy.docs})`}
        </Link>
      </Box>
      <Link href={pluginHref} newTab>
        {copy.netlifyBuildPlugin}
      </Link>
      <Link href={variablesHref} margin={{ vertical: "small" }} newTab>
        {copy.netlifyBuildVariable}
      </Link>
      <CodeBlock>{apiKey}</CodeBlock>
    </>
  );
}
