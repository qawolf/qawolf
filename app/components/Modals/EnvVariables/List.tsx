import { Box } from "grommet";
import { ReactNode, useContext, useState } from "react";
import { useEnvironmentVariables } from "../../../hooks/queries";
import { copy } from "../../../theme/copy";
import Divider from "../../shared-new/Divider";
import Text from "../../shared-new/Text";
import { StateContext } from "../../StateContext";
import ListItem, { nameWidth } from "./ListItem";

export default function List(): JSX.Element {
  const [editEnvironmentVariableId, setEditEnvironmentVariableId] = useState<
    string | null
  >(null);

  const { environmentId } = useContext(StateContext);
  const { data } = useEnvironmentVariables({ environment_id: environmentId });

  const handleCancelClick = (): void => {
    setEditEnvironmentVariableId(null);
    // setIsCreate(false);
  };

  const handleEditClick = (variableId: string): void => {
    setEditEnvironmentVariableId(variableId);
    // setIsCreate(false);
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
      <Divider />
    </>
  );
}
