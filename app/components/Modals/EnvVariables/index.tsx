import { useContext, useState } from "react";
import { useEnvironments } from "../../../hooks/queries";

import { EnvironmentVariable } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import Modal from "../../shared-new/Modal";
import Text from "../../shared-new/Text";
import { StateContext } from "../../StateContext";
import ConfirmDelete from "./ConfirmDelete";
import List from "./List";
import SelectEnvironment from "./SelectEnvironment";

type Props = {
  closeModal: () => void;
};

export default function Environments({ closeModal }: Props): JSX.Element {
  const { environmentId, teamId } = useContext(StateContext);

  // have internal state for selected environment so editing variables
  // doesn't change environment id in global state
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState(
    environmentId
  );

  const [
    deleteEnvironmentVariable,
    setDeleteEnvironmentVariable,
  ] = useState<EnvironmentVariable | null>(null);

  const { data } = useEnvironments({ team_id: teamId }, { environmentId });

  const handleClose = (): void => setDeleteEnvironmentVariable(null);

  const handleDeleteClick = (
    environmentVariable: EnvironmentVariable
  ): void => {
    setDeleteEnvironmentVariable(environmentVariable);
  };

  return (
    <Modal
      closeModal={closeModal}
      label={
        deleteEnvironmentVariable ? copy.envVariableDelete : copy.envVariables
      }
    >
      {deleteEnvironmentVariable ? (
        <ConfirmDelete
          environmentVariable={deleteEnvironmentVariable}
          onClose={handleClose}
        />
      ) : (
        <>
          <Text
            color="gray9"
            margin={{ top: "xxsmall" }}
            size="componentParagraph"
          >
            {copy.envVariablesDetail}
          </Text>
          <SelectEnvironment
            environments={data?.environments || []}
            onOptionClick={setSelectedEnvironmentId}
            selectedEnvironmentId={selectedEnvironmentId}
          />
          <List
            closeModal={closeModal}
            environmentId={selectedEnvironmentId}
            onDeleteClick={handleDeleteClick}
          />
        </>
      )}
    </Modal>
  );
}
