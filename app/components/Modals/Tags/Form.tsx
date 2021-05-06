import { ChangeEvent, useContext, useState } from "react";

import { useCreateTag } from "../../../hooks/mutations";
import { copy } from "../../../theme/copy";
import TextInput from "../../shared/AppTextInput";
import ListItemForm from "../../shared/ListItemForm";
import { StateContext } from "../../StateContext";

type Props = {
  onCancel: () => void;
};

export const id = "tag";

export default function Form({ onCancel }: Props): JSX.Element {
  const { teamId } = useContext(StateContext);

  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");

  const [createTag, { loading: isCreateLoading }] = useCreateTag();

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setName(e.target.value);
  };

  const handleSave = (): void => {
    if (!name || name.includes(",")) {
      setNameError(name ? copy.noCommas : copy.required);
      return;
    }

    setNameError("");

    createTag({ variables: { name, team_id: teamId } }).then(onCancel);
  };

  return (
    <ListItemForm
      isSaveDisabled={isCreateLoading}
      onCancel={onCancel}
      onSave={handleSave}
    >
      <TextInput
        autoFocus
        error={nameError}
        id={id}
        onChange={handleNameChange}
        placeholder={copy.tagName}
        value={name}
        width="full"
      />
    </ListItemForm>
  );
}
