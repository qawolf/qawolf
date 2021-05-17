import { Box } from "grommet";

import { copy } from "../../../theme/copy";
import Link, { buildQaWolfDocsLink } from "../../shared/Link";
import ModalHeader from "../../shared/Modal/Header";
import Text from "../../shared/Text";

type Props = { closeModal: () => void };

const textProps = {
  color: "gray9",
  size: "componentParagraph" as const,
};

export default function Header({ closeModal }: Props): JSX.Element {
  const apiDocsHref = buildQaWolfDocsLink("/run-tests-with-api");
  const cliDocsHref = buildQaWolfDocsLink("/run-tests-with-cli");

  return (
    <>
      <ModalHeader closeModal={closeModal} label={copy.triggers} />
      <Box margin={{ bottom: "medium", top: "xxsmall" }}>
        <Text {...textProps}>{copy.triggersDetail}</Text>
        <Box align="center" direction="row">
          <Text {...textProps} margin={{ right: "xxxsmall" }}>
            {copy.apiDetail}
          </Text>
          <Link href={apiDocsHref} newTab>
            {copy.api}
          </Link>
          <Text {...textProps} margin={{ horizontal: "xxxsmall" }}>
            {copy.or}
          </Text>
          <Link href={cliDocsHref} newTab>
            {copy.cli}
          </Link>{" "}
          <Text {...textProps} margin={{ right: "xxxsmall" }}>
            .
          </Text>
        </Box>
      </Box>
    </>
  );
}
