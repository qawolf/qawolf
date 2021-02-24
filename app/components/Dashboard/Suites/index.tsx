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
    <Box pad={{ top: "medium" }} width="full">
      <Box
        align="center"
        direction="row"
        flex={false}
        height={edgeSize.large}
        pad={{ horizontal: "medium" }}
      >
        <Text color="gray9" size="componentHeader">
          {copy.runHistory}
        </Text>
      </Box>
      <Box margin={{ top: "medium" }} overflow={{ vertical: "scroll" }}>
        <Box border={{ ...border, side: "top" }} flex={false}>
          {suitesHtml}
        </Box>
      </Box>
    </Box>
  );
}
