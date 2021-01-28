import { Box } from "grommet";
import { ChangeEvent, useContext, useState } from "react";
import {
  useCreateEnvironmentVariable,
  useUpdateEnvironmentVariable,
} from "../../../hooks/mutations";
import { EnvironmentVariable } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import { edgeSize } from "../../../theme/theme-new";

import TextInput from "../../shared-new/AppTextInput";
import ListItemForm from "../../shared-new/ListItemForm";
import { StateContext } from "../../StateContext";

type Props = {
  environmentVariable?: EnvironmentVariable;
  onCancelClick: () => void;
};

export const id = "environment-variable";

export default function Form({
  environmentVariable,
  onCancelClick,
}: Props): JSX.Element {
  const [hasNameError, setHasNameError] = useState(false);
  const [hasValueError, setHasValueError] = useState(false);

  const [name, setName] = useState(environmentVariable?.name || "");
  const [value, setValue] = useState(environmentVariable?.value || "");

  const { environmentId } = useContext(StateContext);

  const [
    createEnvironmentVariable,
    { loading: isCreateLoading },
  ] = useCreateEnvironmentVariable();
  const [
    updateEnvironmentVariable,
    { loading: isEditLoading },
  ] = useUpdateEnvironmentVariable();

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setName(e.target.value);
  };

  const handleValueChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setValue(e.target.value);
  };

  const handleSaveClick = (): void => {
    if (!name) {
      setHasNameError(true);
      return;
    }
    if (!value) {
      setHasValueError(true);
      return;
    }

    setHasNameError(false);
    setHasValueError(false);

    if (environmentVariable) {
      updateEnvironmentVariable({
        variables: { id: environmentVariable.id, name, value },
        // close form after environment variable is updated
      }).then(onCancelClick);
    } else {
      createEnvironmentVariable({
        variables: {
          environment_id: environmentId,
          name,
          value,
        },
      }).then(onCancelClick);
    }
  };

  return (
    <ListItemForm
      focusId={id}
      isSaveDisabled={isCreateLoading || isEditLoading}
      onCancelClick={onCancelClick}
      onSaveClick={handleSaveClick}
    >
      <TextInput
        hasError={hasNameError}
        id={id}
        onChange={handleNameChange}
        placeholder={copy.envVariableNamePlaceholder}
        value={name}
      />
      <Box flex={false} width={edgeSize.xxsmall} />
      <TextInput
        hasError={hasValueError}
        onChange={handleValueChange}
        placeholder={copy.envVariableValuePlaceholder}
        value={value}
      />
    </ListItemForm>
  );
}
