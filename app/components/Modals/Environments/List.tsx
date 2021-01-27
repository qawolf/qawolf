import { Box } from "grommet";
import { useEnvironments } from "../../../hooks/queries";
import { ReactNode, useContext, useState } from "react";
import { StateContext } from "../../StateContext";
import Text from "../../shared-new/Text";
import { copy } from "../../../theme/copy";
import Divider from "../../shared-new/Divider";
import ListItem from "./ListItem";

export default function List(): JSX.Element {
  const [editEnvironmentId, setEditEnvironmentId] = useState<string | null>(
    null
  );

  const { teamId } = useContext(StateContext);
  const { data } = useEnvironments({ team_id: teamId });

  const placeholderHtml = data?.environments.length ? null : (
    <Text
      color="gray9"
      margin={{ vertical: "xxxlarge" }}
      size="componentParagraph"
      textAlign="center"
    >
      {data?.environments ? copy.environmentsEmpty : copy.loading}
    </Text>
  );

  const environmentsHtml: ReactNode[] = [];

  if (data?.environments.length) {
    for (let i = 0; i < data.environments.length; i++) {
      const environment = data.environments[i];

      environmentsHtml.push(
        <ListItem
          editEnvironmentId={editEnvironmentId}
          environment={environment}
          key={environment.id}
          setEditEnvironmentId={setEditEnvironmentId}
        />
      );

      if (i < data.environments.length - 1) {
        environmentsHtml.push(<Divider key={i} />);
      }
    }
  }

  return (
    <Box margin={{ top: "large" }}>
      <Text color="gray9" size="componentBold">
        {copy.environment}
      </Text>
      <Divider margin={{ top: "xxsmall" }} />
      <Box overflow="auto">{environmentsHtml}</Box>
      {placeholderHtml}
      <Divider />
    </Box>
  );
}
