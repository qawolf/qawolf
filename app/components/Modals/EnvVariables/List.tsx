import { Box } from "grommet";
import { ReactNode, useEffect, useState } from "react";

import { useEnvironmentVariables } from "../../../hooks/queries";
import { EnvironmentVariable } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import Divider from "../../shared-new/Divider";
import ModalButtons from "../../shared-new/ModalButtons";
import Text from "../../shared-new/Text";
import Form, { id as formInputId } from "./Form";
import ListItem, { nameWidth } from "./ListItem";

type Props = {
  closeModal: () => void;
  environmentId: string;
  onDeleteClick: (environmentVariable: EnvironmentVariable) => void;
};

export default function List({
  closeModal,
  environmentId,
  onDeleteClick,
}: Props): JSX.Element {
  const [isCreate, setIsCreate] = useState(false);
  const [editEnvironmentVariableId, setEditEnvironmentVariableId] = useState<
    string | null
  >(null);

  const { data } = useEnvironmentVariables({ environment_id: environmentId });

  const handleCancelClick = (): void => {
    setEditEnvironmentVariableId(null);
    setIsCreate(false);
  };

  // reset forms if selected environment changes
  useEffect(handleCancelClick, [environmentId]);

  const handleCreateClick = (): void => {
    setEditEnvironmentVariableId(null); // clear existing forms
    setIsCreate(true);
    // focus form if it already exists
    document.getElementById(formInputId)?.focus();
  };

  const handleEditClick = (variableId: string): void => {
    setEditEnvironmentVariableId(variableId);
    setIsCreate(false);
  };

  const placeholderHtml = data?.environmentVariables?.variables
    .length ? null : (
    <Text
      color="gray9"
      margin={{ vertical: "xxxlarge" }}
      size="componentParagraph"
      textAlign="center"
    >
      {data?.environmentVariables ? copy.envVariablesEmpty : copy.loading}
    </Text>
  );

  const variablesHtml: ReactNode[] = [];

  if (data?.environmentVariables?.variables.length) {
    for (let i = 0; i < data.environmentVariables.variables.length; i++) {
      const environmentVariable = data.environmentVariables.variables[i];

      variablesHtml.push(
        <ListItem
          editEnvironmentVariableId={editEnvironmentVariableId}
          environmentVariable={environmentVariable}
          key={environmentVariable.id}
          onCancelClick={handleCancelClick}
          onDeleteClick={() => onDeleteClick(environmentVariable)}
          onEditClick={handleEditClick}
        />
      );

      if (i < data.environmentVariables.variables.length - 1) {
        variablesHtml.push(<Divider key={i} />);
      }
    }
  }

  return (
    <>
      <Box direction="row" margin={{ bottom: "xxsmall", top: "medium" }}>
        <Box width={nameWidth}>
          <Text color="gray9" size="componentBold">
            {copy.name}
          </Text>
        </Box>
        <Text color="gray9" margin={{ left: "xxsmall" }} size="componentBold">
          {copy.value}
        </Text>
      </Box>
      <Divider />
      <Box overflow="auto">{variablesHtml}</Box>
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
        secondaryLabel={copy.envVariableNew}
      />
    </>
  );
}
