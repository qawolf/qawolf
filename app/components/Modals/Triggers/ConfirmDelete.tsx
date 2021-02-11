import { ChangeEvent, useState } from "react";

import { useDeleteTrigger } from "../../../hooks/mutations";
import { Trigger } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import TextInput from "../../shared-new/AppTextInput";
import ConfirmDelete from "../../shared-new/Modal/ConfirmDelete";
import Header from "../../shared-new/Modal/Header";
import Text from "../../shared-new/Text";

type Props = {
  closeModal: () => void;
  onClose: () => void;
  trigger: Trigger;
};

export default function ConfirmDeleteTrigger({
  closeModal,
  onClose,
  trigger,
}: Props): JSX.Element {
  const [error, setError] = useState("");
  const [name, setName] = useState("");

  const [deleteTrigger, { loading }] = useDeleteTrigger();

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setName(e.target.value);
  };

  const handleDelete = (): void => {
    if (name !== trigger.name) {
      setError(copy.mustMatch);
      return;
    }

    setError("");
    deleteTrigger({ variables: { id: trigger.id } }).then(onClose);
  };

  return (
    <>
      <Header closeModal={closeModal} label={copy.deleteTrigger} />
      <ConfirmDelete
        isDeleteDisabled={loading}
        onCancel={onClose}
        onDelete={handleDelete}
      >
        <Text
          color="gray9"
          margin={{ bottom: "medium", top: "xxsmall" }}
          size="componentParagraph"
        >
          {copy.triggerDeleteConfirm} <b>{trigger.name}</b>{" "}
          {copy.triggerDeleteConfirm2}
        </Text>
        <TextInput
          autoFocus
          error={error}
          onChange={handleChange}
          placeholder={trigger.name}
          value={name}
        />
      </ConfirmDelete>
    </>
  );
}
