import { Box } from "grommet";
import { useState } from "react";
import { useEnvironments } from "../../../../hooks/queries";
import { Environment } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import { edgeSize } from "../../../../theme/theme";
import Text from "../../../shared-new/Text";
import ListItem from "./ListItem";

type Props = {
  environmentId: string;
  onDelete: (environment: Environment) => void;
  setSelectedEnvironmentId: (environmentId: string) => void;
  teamId: string;
};

const width = "240px";

export default function Environments({
  environmentId,
  onDelete,
  setSelectedEnvironmentId,
  teamId,
}: Props): JSX.Element {
  const [editEnvrionmentId, setEditEnvrionmentId] = useState<string | null>(
    null
  );

  const { data } = useEnvironments({ team_id: teamId }, { environmentId });

  const handleCancel = (): void => {
    setEditEnvrionmentId(null);
  };

  const environmentsHtml = (data?.environments || []).map((environment) => {
    return (
      <ListItem
        editEnvironmentId={editEnvrionmentId}
        environment={environment}
        key={environment.id}
        onCancel={handleCancel}
        onClick={() => setSelectedEnvironmentId(environment.id)}
        onDelete={() => onDelete(environment)}
        onEdit={() => setEditEnvrionmentId(environment.id)}
      />
    );
  });

  return (
    <Box flex={false} pad="medium" width={width}>
      <Box height={edgeSize.large} justify="center">
        <Text color="gray9" size="componentHeader">
          {copy.environments}
        </Text>
      </Box>
      <Box flex={false} margin={{ top: "xxsmall" }}>
        {environmentsHtml}
      </Box>
    </Box>
  );
}
