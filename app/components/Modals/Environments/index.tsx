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

  const [
    deleteEnvironment,
    setDeleteEnvironment,
  ] = useState<MutableListFields | null>(null);

  const [
    deleteEnvironmentVariable,
    setDeleteEnvironmentVariable,
  ] = useState<EnvironmentVariable | null>(null);

  const handleCloseDeleteEnvironment = (): void => {
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
          environmentId={environmentId}
          onDelete={handleDeleteEnvironment}
          teamId={teamId}
        />
        <Variables
          closeModal={closeModal}
          environmentId={environmentId}
          onDelete={handleDeleteVariable}
        />
      </Box>
    </Modal>
  );
}
