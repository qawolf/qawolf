import { Box } from "grommet";
import { useContext } from "react";

import { useSuites } from "../../../hooks/queries";
import { copy } from "../../../theme/copy";
import { border, edgeSize } from "../../../theme/theme";
import Spinner from "../../shared/Spinner";
import Text from "../../shared/Text";
import { StateContext } from "../../StateContext";
import SuiteCard from "./SuiteCard";

type Props = { teamId: string };

export default function Suites({ teamId }: Props): JSX.Element {
  const { data } = useSuites({ team_id: teamId }, { pollInterval: 10 * 1000 });
  const suites = data?.suites;

  if (!suites) return <Spinner />;

  const suitesHtml = suites.map((s) => {
    return <SuiteCard key={s.id} suite={s} />;
  });

  return (
    <Box width="full">
      <Box
        align="center"
        border={{ ...border, side: "bottom" }}
        direction="row"
        flex={false}
        // line up with sidebar
        height={`calc(${edgeSize.large} + 2 * ${edgeSize.medium})`}
        pad={{ horizontal: "medium" }}
      >
        <Text color="gray9" size="componentHeader">
          {copy.runHistory}
        </Text>
      </Box>
      {suites.length ? (
        <Box overflow={{ vertical: "auto" }}>
          <Box flex={false}>{suitesHtml}</Box>
        </Box>
      ) : (
        <Text color="gray9" margin="medium" size="component">
          {copy.noHistory}
        </Text>
      )}
    </Box>
  );
}
