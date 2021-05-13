import { ChangeEvent, useContext, useState } from "react";

import { useCreateTag, useUpdateTag } from "../../../hooks/mutations";
import { Tag } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import TextInput from "../../shared/AppTextInput";
import ListItemForm from "../../shared/ListItemForm";
import { StateContext } from "../../StateContext";

type Props = {
  onClose: () => void;
  tag?: Tag;
};

export const id = "tag";

export default function Form({ tag, onClose }: Props): JSX.Element {
  const { teamId } = useContext(StateContext);

  const [name, setName] = useState(tag?.name || "");
  const [nameError, setNameError] = useState("");

  const [createTag, { loading: isCreateLoading }] = useCreateTag();
  const [updateTag, { loading: isEditLoading }] = useUpdateTag();

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setName(e.target.value);
  };

  const handleSave = (): void => {
    if (!name || name.includes(",")) {
      setNameError(name ? copy.noCommas : copy.required);
      return;
    }

    setNameError("");

    if (tag) {
      updateTag({
        variables: { id: tag.id, name },
      }).then(onClose);
    } else {
      createTag({ variables: { name, team_id: teamId } }).then(onClose);
    }
  };

  return (
    <ListItemForm
      isSaveDisabled={isCreateLoading || isEditLoading}
      onCancel={onClose}
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
