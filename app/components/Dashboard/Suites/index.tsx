import { Box } from "grommet";
import { useContext, useEffect } from "react";

import { useSuites } from "../../../hooks/queries";
import { copy } from "../../../theme/copy";
import { border, edgeSize } from "../../../theme/theme-new";
import Spinner from "../../shared-new/Spinner";
import Text from "../../shared-new/Text";
import { StateContext } from "../../StateContext";
import SuiteCard from "./SuiteCard";

export default function Suites(): JSX.Element {
  const { teamId } = useContext(StateContext);

  const { data, startPolling, stopPolling } = useSuites({ team_id: teamId });
  const suites = data?.suites;

  // poll for updates
  useEffect(() => {
    startPolling(10 * 1000);

    return () => {
      stopPolling();
    };
  }, [startPolling, stopPolling, teamId]);

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
      <Box overflow={{ vertical: "scroll" }}>
        <Box flex={false}>{suitesHtml}</Box>
      </Box>
    </Box>
  );
}
