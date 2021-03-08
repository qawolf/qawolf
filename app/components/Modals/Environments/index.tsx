import { Box } from "grommet";
import { useContext, useState } from "react";

import { EnvironmentVariable, MutableListFields } from "../../../lib/types";
import Modal from "../../shared/Modal";
import { StateContext } from "../../StateContext";
import Environments from "./Environments";
import ConfirmDeleteEnvironment from "./Environments/ConfirmDelete";
import Variables from "./Variables";
import ConfirmDeleteVariable from "./Variables/ConfirmDelete";

type Props = { closeModal: () => void };

const width = "800px";

export default function EnvironmentsModal({ closeModal }: Props): JSX.Element {
  const { environmentId, teamId } = useContext(StateContext);

  // have internal state for selected environment so editing variables
  // doesn't change environment id in global state
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<
    string | null
  >(environmentId);

  const [
    deleteEnvironment,
    setDeleteEnvironment,
  ] = useState<MutableListFields | null>(null);

  const [
    deleteEnvironmentVariable,
    setDeleteEnvironmentVariable,
  ] = useState<EnvironmentVariable | null>(null);

  const handleCloseDeleteEnvironment = (
    deletedEnvironmentId?: string
  ): void => {
    if (deletedEnvironmentId === selectedEnvironmentId) {
      setSelectedEnvironmentId(null);
    }

    setDeleteEnvironment(null);
  };

  const handleCloseDeleteEnvironmentVariable = (): void => {
    setDeleteEnvironmentVariable(null);
  };

  const handleDeleteEnvironment = (environment: MutableListFields): void => {
    setDeleteEnvironment(environment);
  };

  const handleDeleteVariable = (
    environmentVariable: EnvironmentVariable
  ): void => {
    setDeleteEnvironmentVariable(environmentVariable);
  };

  if (deleteEnvironment) {
    return (
      <Modal closeModal={closeModal}>
        <ConfirmDeleteEnvironment
          closeModal={closeModal}
          environment={deleteEnvironment}
          onClose={handleCloseDeleteEnvironment}
        />
      </Modal>
    );
  }

  if (deleteEnvironmentVariable) {
    return (
      <Modal closeModal={closeModal}>
        <ConfirmDeleteVariable
          closeModal={closeModal}
          environmentVariable={deleteEnvironmentVariable}
          onClose={handleCloseDeleteEnvironmentVariable}
        />
      </Modal>
    );
  }

  return (
    <Modal closeModal={closeModal} width={width}>
      <Box direction="row">
        <Environments
          environmentId={selectedEnvironmentId}
          onDelete={handleDeleteEnvironment}
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
