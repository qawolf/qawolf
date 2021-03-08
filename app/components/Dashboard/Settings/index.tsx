import { Box } from "grommet";
import { useContext } from "react";

import { useIntegrations, useTeam } from "../../../hooks/queries";
import { copy } from "../../../theme/copy";
import { border, edgeSize } from "../../../theme/theme";
import Spinner from "../../shared/Spinner";
import Text from "../../shared/Text";
import { StateContext } from "../../StateContext";
import Alerts from "./Alerts";
import Members from "./Members";
import Team from "./Team";

const maxWidth = "640px";

export default function Settings(): JSX.Element {
  const { teamId } = useContext(StateContext);

  const { data } = useTeam({ id: teamId });
  const team = data?.team || null;

  const { data: integrationsData } = useIntegrations({ team_id: teamId });
  const slackIntegrations = (integrationsData?.integrations || []).filter(
    (i) => i.type === "slack"
  );

  if (!team) return <Spinner />;

  return (
    <Box width="full">
      <Box border={{ ...border, side: "bottom" }} justify="center" pad="medium">
        <Box height={edgeSize.large} justify="center">
          <Text color="gray9" size="componentHeader">
            {copy.settings}
          </Text>
        </Box>
      </Box>
      <Box overflow={{ vertical: "auto" }}>
        <Box flex={false} pad="medium" style={{ maxWidth }}>
          <Team team={team} />
          <Members team={team} />
          <Alerts integrations={slackIntegrations} team={team} />
        </Box>
      </Box>
    </Box>
  );
}
