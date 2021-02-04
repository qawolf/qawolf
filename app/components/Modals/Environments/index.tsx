import { Box } from "grommet";
import Modal from "../../shared-new/Modal";
import Variables from "./Variables";
import Environments from "./Environments";
import { Environment, EnvironmentVariable } from "../../../lib/types";
import { useContext, useState } from "react";
import ConfirmDelete from "./Variables/ConfirmDelete";
import { StateContext } from "../../StateContext";

type Props = { closeModal: () => void };

const width = "800px";

export default function EnvironmentsModal({ closeModal }: Props): JSX.Element {
  const { environmentId, teamId } = useContext(StateContext);

  // have internal state for selected environment so editing variables
  // doesn't change environment id in global state
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState(
    environmentId
  );

  const [
    deleteEnvironment,
    setDeleteEnvironment,
  ] = useState<Environment | null>(null);

  const [
    deleteEnvironmentVariable,
    setDeleteEnvironmentVariable,
  ] = useState<EnvironmentVariable | null>(null);

  const handleDeleteVariable = (
    environmentVariable: EnvironmentVariable
  ): void => {
    setDeleteEnvironmentVariable(environmentVariable);
  };

  const handleCancelDeleteVariable = (): void => {
    setDeleteEnvironmentVariable(null);
  };

  if (deleteEnvironmentVariable) {
    return (
      <Modal closeModal={closeModal}>
        <ConfirmDelete
          closeModal={closeModal}
          environmentVariable={deleteEnvironmentVariable}
          onCancel={handleCancelDeleteVariable}
        />
      </Modal>
    );
  }

  return (
    <Modal closeModal={closeModal} width={width}>
      <Box direction="row">
        <Environments
          environmentId={selectedEnvironmentId}
          setSelectedEnvironmentId={setSelectedEnvironmentId}
          teamId={teamId}
        />
        <Variables
          closeModal={closeModal}
          environmentId={selectedEnvironmentId}
          onDelete={handleDeleteVariable}
        />
      </Box>
    </Modal>
  );
}
