import { Box } from "grommet";
import { useEnvironments } from "../../../hooks/queries";
import { ReactNode, useContext } from "react";
import { StateContext } from "../../StateContext";
import Text from "../../shared-new/Text";
import { copy } from "../../../theme/copy";
import Divider from "../../shared-new/Divider";
import ListItem from "./ListItem";

export default function List(): JSX.Element {
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
        <ListItem environment={environment} key={environment.id} />
      );

      if (i < data.environments.length - 1) {
        environmentsHtml.push(<Divider />);
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
