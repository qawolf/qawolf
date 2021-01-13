import { Box } from "grommet";

import { useEnvironmentVariables } from "../../../hooks/queries";
import { SelectedGroup } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import TableHeader from "../../shared/TableHeader";
import Text from "../../shared/Text";
import ListItems, { BASIS } from "./ListItems";

const LABELS = [copy.name, copy.value, copy.created];

type Props = { group: SelectedGroup };

export default function EnvVariablesList({ group }: Props): JSX.Element {
  const { data } = useEnvironmentVariables({ group_id: group.id });

  const innerHtml = !data?.environmentVariables.variables.length ? (
    <Text color="black" size="medium" weight="bold">
      {!data?.environmentVariables
        ? copy.loading
        : copy.envVariablesEmpty(group.name)}
    </Text>
  ) : (
    <Box fill="horizontal">
      <TableHeader basis={BASIS} labels={LABELS} />
      <ListItems environmentVariables={data.environmentVariables.variables} />
    </Box>
  );

  return (
    <Box align="center" margin={{ vertical: "large" }}>
      {innerHtml}
    </Box>
  );
}
