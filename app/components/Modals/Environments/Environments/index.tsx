import { Box } from "grommet";
import { useState } from "react";

import { useEnvironments } from "../../../../hooks/queries";
import { Environment } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import { edgeSize } from "../../../../theme/theme";
import Text from "../../../shared-new/Text";
import AddEnvironment from "./AddEnvironment";
import EnvironmentName, { id as formInputId } from "./EnvironmentName";
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
  const [editEnvironmentId, setEditEnvironmentId] = useState<string | null>(
    null
  );
  const [isCreate, setIsCreate] = useState(false);

  const { data } = useEnvironments({ team_id: teamId }, { environmentId });

  const handleCancel = (): void => {
    setEditEnvironmentId(null);
    setIsCreate(false);
  };

  const handleCreate = (): void => {
    setEditEnvironmentId(null); // clear existing forms
    setIsCreate(true);
    // focus form if it already exists
    document.getElementById(formInputId)?.focus();
  };

  const handleEdit = (environmentId: string): void => {
    setEditEnvironmentId(environmentId);
    setIsCreate(false);
  };

  const environmentsHtml = (data?.environments || []).map((environment) => {
    return (
      <ListItem
        editEnvironmentId={editEnvironmentId}
        environment={environment}
        isSelected={environment.id === environmentId}
        key={environment.id}
        onCancel={handleCancel}
        onClick={() => setSelectedEnvironmentId(environment.id)}
        onDelete={() => onDelete(environment)}
        onEdit={() => handleEdit(environment.id)}
        teamId={teamId}
      />
    );
  });

  return (
    <Box flex={false} pad="medium" width={width}>
      <Box flex={false} height={edgeSize.large} justify="center">
        <Text color="gray9" size="componentHeader">
          {copy.environments}
        </Text>
      </Box>
      <Box margin={{ top: "xxsmall" }} overflow={{ vertical: "auto" }}>
        {environmentsHtml}
        {isCreate && (
          <EnvironmentName
            onCancel={handleCancel}
            setSelectedEnvironmentId={setSelectedEnvironmentId}
            teamId={teamId}
          />
        )}
        <AddEnvironment onClick={handleCreate} />
      </Box>
    </Box>
  );
}
