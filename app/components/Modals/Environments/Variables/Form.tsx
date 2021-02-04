import { Box } from "grommet";
import { ChangeEvent, useState } from "react";

import {
  useCreateEnvironmentVariable,
  useUpdateEnvironmentVariable,
} from "../../../../hooks/mutations";
import { EnvironmentVariable } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import { edgeSize } from "../../../../theme/theme-new";
import TextInput from "../../../shared-new/AppTextInput";
import ListItemForm from "../../../shared-new/ListItemForm";

type Props = {
  environmentId: string;
  environmentVariable?: EnvironmentVariable;
  onCancel: () => void;
};

export const id = "environment-variable";

export default function Form({
  environmentId,
  environmentVariable,
  onCancel,
}: Props): JSX.Element {
  const [hasNameError, setHasNameError] = useState(false);
  const [hasValueError, setHasValueError] = useState(false);

  const [name, setName] = useState(environmentVariable?.name || "");
  const [value, setValue] = useState(environmentVariable?.value || "");

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
      }).then(onCancel);
    } else {
      createEnvironmentVariable({
        variables: {
          environment_id: environmentId,
          name,
          value,
        },
      }).then(onCancel);
    }
  };

  return (
    <ListItemForm
      focusId={id}
      isSaveDisabled={isCreateLoading || isEditLoading}
      onCancel={onCancel}
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
