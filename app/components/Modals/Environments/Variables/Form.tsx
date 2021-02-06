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

const width = `calc(50% - (${edgeSize.xxsmall} / 2))`;

export default function Form({
  environmentId,
  environmentVariable,
  onCancel,
}: Props): JSX.Element {
  const [nameError, setNameError] = useState("");
  const [valueError, setValueError] = useState("");

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

  const handleSave = (): void => {
    if (!name || !value) {
      setNameError(name ? "" : copy.required);
      setValueError(value ? "" : copy.required);
      return;
    }

    setNameError("");
    setValueError("");

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
      isSaveDisabled={isCreateLoading || isEditLoading}
      onCancel={onCancel}
      onSave={handleSave}
    >
      <TextInput
        autoFocus
        error={nameError}
        id={id}
        onChange={handleNameChange}
        placeholder={copy.envVariableNamePlaceholder}
        value={name}
        width={width}
      />
      <TextInput
        error={valueError}
        onChange={handleValueChange}
        placeholder={copy.envVariableValuePlaceholder}
        value={value}
        width={width}
      />
    </ListItemForm>
  );
}
