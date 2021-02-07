import { Box } from "grommet";
import { ReactNode, useEffect, useState } from "react";

import { useEnvironmentVariables } from "../../../../hooks/queries";
import { EnvironmentVariable } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import Divider from "../../../shared-new/Divider";
import Add from "../../../shared-new/icons/Add";
import ModalButtons from "../../../shared-new/Modal/Buttons";
import Text from "../../../shared-new/Text";
import Form, { id as formInputId } from "./Form";
import ListItem, { nameWidth } from "./ListItem";

type Props = {
  closeModal: () => void;
  environmentId: string | null;
  onDelete: (environmentVariable: EnvironmentVariable) => void;
};

export default function List({
  closeModal,
  environmentId,
  onDelete,
}: Props): JSX.Element {
  const [isCreate, setIsCreate] = useState(false);
  const [editEnvironmentVariableId, setEditEnvironmentVariableId] = useState<
    string | null
  >(null);

  const { data } = useEnvironmentVariables({ environment_id: environmentId });

  const handleCancel = (): void => {
    setEditEnvironmentVariableId(null);
    setIsCreate(false);
  };

  // reset forms if selected environment changes
  useEffect(handleCancel, [environmentId]);

  const handleCreate = (): void => {
    setEditEnvironmentVariableId(null); // clear existing forms
    setIsCreate(true);
    // focus form if it already exists
    document.getElementById(formInputId)?.focus();
  };

  const handleEdit = (variableId: string): void => {
    setEditEnvironmentVariableId(variableId);
    setIsCreate(false);
  };

  let placeholderHtml: JSX.Element | null = null;

  if (!data?.environmentVariables?.variables.length) {
    let message = copy.loading;
    if (data?.environmentVariables) message = copy.envVariablesEmpty;
    if (!environmentId) message = copy.envVariablesNoEnvironment;

    placeholderHtml = (
      <Text
        color="gray9"
        margin={{ vertical: "xxxlarge" }}
        size="componentParagraph"
        textAlign="center"
      >
        {message}
      </Text>
    );
  }

  const variablesHtml: ReactNode[] = [];

  if (data?.environmentVariables?.variables.length) {
    for (let i = 0; i < data.environmentVariables.variables.length; i++) {
      const environmentVariable = data.environmentVariables.variables[i];

      variablesHtml.push(
        <ListItem
          editEnvironmentVariableId={editEnvironmentVariableId}
          environmentVariable={environmentVariable}
          key={environmentVariable.id}
          onCancel={handleCancel}
          onDelete={() => onDelete(environmentVariable)}
          onEdit={handleEdit}
        />
      );

      if (i < data.environmentVariables.variables.length - 1) {
        variablesHtml.push(<Divider key={i} />);
      }
    }
  }

  return (
    <>
      <Box
        direction="row"
        flex={false}
        margin={{ bottom: "xxsmall", top: "medium" }}
      >
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
      <Box overflow={{ vertical: "auto" }}>{variablesHtml}</Box>
      {placeholderHtml}
      {isCreate && (
        <>
          <Divider />
          <Form environmentId={environmentId} onCancel={handleCancel} />
        </>
      )}
      <Divider />
      <ModalButtons
        SecondaryIconComponent={Add}
        hideSecondary={!environmentId}
        onPrimaryClick={closeModal}
        onSecondaryClick={handleCreate}
        secondaryLabel={copy.envVariableNew}
      />
    </>
  );
}
