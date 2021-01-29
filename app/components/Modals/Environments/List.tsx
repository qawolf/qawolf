import { Box } from "grommet";
import { ReactNode, useContext, useState } from "react";

import { useEnvironments } from "../../../hooks/queries";
import { Environment } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import Divider from "../../shared-new/Divider";
import ModalButtons from "../../shared-new/ModalButtons";
import Text from "../../shared-new/Text";
import { StateContext } from "../../StateContext";
import Form, { id as formInputId } from "./Form";
import ListItem from "./ListItem";

type Props = {
  closeModal: () => void;
  onDeleteClick: (environment: Environment) => void;
};

export default function List({
  closeModal,
  onDeleteClick,
}: Props): JSX.Element {
  const [isCreate, setIsCreate] = useState(false);
  const [editEnvironmentId, setEditEnvironmentId] = useState<string | null>(
    null
  );

  const { environmentId, teamId } = useContext(StateContext);
  const { data } = useEnvironments({ team_id: teamId }, { environmentId });

  const handleCancelClick = (): void => {
    setEditEnvironmentId(null);
    setIsCreate(false);
  };

  const handleCreateClick = (): void => {
    setEditEnvironmentId(null); // clear existing forms
    setIsCreate(true);
    // focus form if it already exists
    document.getElementById(formInputId)?.focus();
  };

  const handleEditClick = (environmentId: string): void => {
    setEditEnvironmentId(environmentId);
    setIsCreate(false);
  };

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
          onCancelClick={handleCancelClick}
          onDeleteClick={onDeleteClick}
          onEditClick={handleEditClick}
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
      {environmentsHtml}
      {placeholderHtml}
      {isCreate && (
        <>
          <Divider />
          <Form onCancelClick={handleCancelClick} />
        </>
      )}
      <Divider />
      <ModalButtons
        closeModal={closeModal}
        onCreateClick={handleCreateClick}
        secondaryLabel={copy.environmentNew}
      />
    </Box>
  );
}
