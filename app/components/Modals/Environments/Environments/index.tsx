import { Box } from "grommet";

import {
  useCreateEnvironment,
  useUpdateEnvironment,
} from "../../../../hooks/mutations";
import { useEnvironments } from "../../../../hooks/queries";
import { MutableListArgs, MutableListFields } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import { edgeSize } from "../../../../theme/theme";
import MutableList from "../../../shared-new/MutableList";
import Text from "../../../shared-new/Text";

type Props = {
  environmentId: string;
  onDelete: (fields: MutableListFields) => void;
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
  const { data } = useEnvironments({ team_id: teamId }, { environmentId });
  const environments = data?.environments;

  const [
    createEnvironment,
    { loading: isCreateLoading },
  ] = useCreateEnvironment();
  const [
    updateEnvironment,
    { loading: isEditLoading },
  ] = useUpdateEnvironment();

  const handleSave = ({ callback, fields, name }: MutableListArgs): void => {
    if (isCreateLoading || isEditLoading) return;

    if (fields) {
      const environment = environments?.find((e) => e.id === fields.id);

      updateEnvironment({
        optimisticResponse: environment
          ? {
              updateEnvironment: {
                ...environment,
                name,
              },
            }
          : undefined,
        variables: { id: fields.id, name },
      }).then(callback);
    } else {
      createEnvironment({ variables: { name, team_id: teamId } }).then(
        (response) => {
          const { data } = response || {};

          // show newly created environment if possible
          if (setSelectedEnvironmentId) {
            setSelectedEnvironmentId(data?.createEnvironment.id);
          }

          callback();
        }
      );
    }
  };

  return (
    <Box flex={false} width={width}>
      <Box
        flex={false}
        height={edgeSize.large}
        justify="center"
        margin={{ bottom: "xxsmall", horizontal: "medium", top: "medium" }}
      >
        <Text color="gray9" size="componentHeader">
          {copy.environments}
        </Text>
      </Box>
      <MutableList
        fieldsList={environments}
        onClick={setSelectedEnvironmentId}
        onDelete={onDelete}
        overflow={{ vertical: "auto" }}
        pad={{ bottom: "medium", horizontal: "medium" }}
        onSave={handleSave}
        selectedId={environmentId}
        type="environment"
      />
    </Box>
  );
}
