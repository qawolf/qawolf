import { Box } from "grommet";

import { copy } from "../../../theme/copy";
import { edgeSize } from "../../../theme/theme";
import ExternalLink, { buildQaWolfDocsLink } from "../../shared/ExternalLink";
import Text from "../../shared/Text";

const textProps = {
  color: "gray9",
  size: "componentParagraph" as const,
};

export default function DocLinks(): JSX.Element {
  const apiDocsHref = buildQaWolfDocsLink("/run-tests-with-api");
  const cliDocsHref = buildQaWolfDocsLink("/run-tests-with-cli");

  return (
    <Box align="center" direction="row" height={edgeSize.xxlarge}>
      <Text {...textProps} margin={{ right: "xxxsmall" }}>
        {copy.apiDetail}
      </Text>
      <ExternalLink href={apiDocsHref}>{copy.api}</ExternalLink>
      <Text {...textProps} margin={{ horizontal: "xxxsmall" }}>
        {copy.or}
      </Text>
      <ExternalLink href={cliDocsHref}>{copy.cli}</ExternalLink>
    </Box>
  );
}
