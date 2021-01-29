import { ChangeEvent, useContext, useState } from "react";

import {
  useCreateEnvironment,
  useUpdateEnvironment,
} from "../../../hooks/mutations";
import { Environment } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import TextInput from "../../shared-new/AppTextInput";
import ListItemForm from "../../shared-new/ListItemForm";
import { StateContext } from "../../StateContext";

type Props = {
  environment?: Environment;
  onCancelClick: () => void;
};

export const id = "environment";

export default function Form({
  environment,
  onCancelClick,
}: Props): JSX.Element {
  const [hasError, setHasError] = useState(false);
  const [name, setName] = useState(environment?.name || "");

  const { teamId } = useContext(StateContext);

  const [
    createEnvironment,
    { loading: isCreateLoading },
  ] = useCreateEnvironment();
  const [
    updateEnvironment,
    { loading: isEditLoading },
  ] = useUpdateEnvironment();

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setName(e.target.value);
  };

  const handleSaveClick = (): void => {
    if (!name) {
      setHasError(true);
      return;
    }

    setHasError(false);

    if (environment) {
      updateEnvironment({ variables: { id: environment.id, name } }).then(
        onCancelClick // close form after environment is updated
      );
    } else {
      createEnvironment({ variables: { name, team_id: teamId } }).then(
        onCancelClick // close form after environment is updated
      );
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
        hasError={hasError}
        id={id}
        onChange={handleChange}
        placeholder={copy.environmentName}
        value={name}
      />
    </ListItemForm>
  );
}
