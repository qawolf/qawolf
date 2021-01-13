import { Box } from "grommet";
import { ReactNode } from "react";

import { Suite } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import Spinner from "../../../shared/Spinner";
import Text from "../../../shared/Text";
import SuiteSummary from "./SuiteSummary";

type Props = {
  selectedSuiteId?: string;
  setHoverSuiteId: (suiteId: string | null) => void;
  suites: Suite[] | null;
};

const WIDTH = "320px";

export default function History({
  selectedSuiteId,
  setHoverSuiteId,
  suites,
}: Props): JSX.Element {
  let suitesHtml: ReactNode | ReactNode[] = (
    <Spinner color="black" noMargin small />
  );

  if (suites && suites.length) {
    suitesHtml = suites.map((suite) => {
      return (
        <SuiteSummary
          key={suite.id}
          selectedSuiteId={selectedSuiteId}
          setHoverSuiteId={setHoverSuiteId}
          suite={suite}
        />
      );
    });
  } else if (suites) {
    suitesHtml = (
      <Text color="black" size="medium" textAlign="center">
        {copy.noHistory}
      </Text>
    );
  }

  return (
    <Box
      align="center"
      background="white"
      elevation="xsmall"
      flex={false}
      height="full"
      pad={{ top: "medium" }}
      round="medium"
      width={WIDTH}
    >
      <Text
        color="black"
        margin={{ bottom: "medium" }}
        size="large"
        weight="bold"
      >
        {copy.history}
      </Text>
      <Box overflow="auto" width="full">
        {suitesHtml}
      </Box>
    </Box>
  );
}
