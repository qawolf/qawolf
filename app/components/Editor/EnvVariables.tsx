import { Box } from "grommet";
import { useContext, useEffect } from "react";

import { useGroups } from "../../hooks/queries";
import { state } from "../../lib/state";
import { overflowStyle } from "../../theme/theme";
import EnvVariablesSettings from "../shared/EnvVariablesSettings";
import Text from "../shared/Text";
import { StateContext } from "../StateContext";

const MAX_WIDTH = "240px";

export default function EnvVariables(): JSX.Element {
  const { groupId, teamId } = useContext(StateContext);

  const { data } = useGroups(
    { team_id: teamId },
    { groupId, skipOnCompleted: true }
  );

  useEffect(() => {
    if (!data?.groups) return;
    // if selected group id is valid, we don't need to update it
    const selectedGroup = data.groups.find((g) => g.id === groupId);
    if (selectedGroup) return;
    // otherwise, set selected group to "All Tests"
    const defaultGroup = data.groups.find((g) => g.is_default);
    if (defaultGroup) {
      state.setGroupId(defaultGroup.id);
    }
  }, [data, groupId]);

  const selectedGroup = data?.groups.find((g) => g.id === groupId);
  if (!selectedGroup) return null;

  return (
    <Box align="center" margin={{ top: "medium" }}>
      <Box
        align="center"
        background="black"
        direction="row"
        pad={{ horizontal: "small", vertical: "xsmall" }}
        round="small"
        style={{ maxWidth: MAX_WIDTH }}
      >
        <Text color="white" isCode size="medium" style={overflowStyle}>
          {selectedGroup.name}
        </Text>
        <EnvVariablesSettings
          color="white"
          dropAlign={{ left: "right" }}
          group={selectedGroup}
        />
      </Box>
    </Box>
  );
}
