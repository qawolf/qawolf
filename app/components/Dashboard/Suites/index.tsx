import { Box } from "grommet";
import { useContext } from "react";

import { useSuites } from "../../../hooks/queries";
import { copy } from "../../../theme/copy";
import { border, edgeSize } from "../../../theme/theme-new";
import Spinner from "../../shared-new/Spinner";
import Text from "../../shared-new/Text";
import { StateContext } from "../../StateContext";
import SuiteCard from "./SuiteCard";

export default function Suites(): JSX.Element {
  const { teamId } = useContext(StateContext);

  const { data } = useSuites({ team_id: teamId });
  const suites = data?.suites;

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
