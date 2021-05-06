import { useState } from "react";

import { useDeleteTag } from "../../../hooks/mutations";
import { Tag } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import CheckBox from "../../shared/CheckBox";
import ConfirmDelete from "../../shared/Modal/ConfirmDelete";
import Header from "../../shared/Modal/Header";
import Text from "../../shared/Text";

type Props = {
  closeModal: () => void;
  onClose: () => void;
  tag: Tag;
};

export default function ConfirmDeleteTag({
  closeModal,
  onClose,
  tag,
}: Props): JSX.Element {
  const [hasError, setHasError] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const [deleteTag, { loading }] = useDeleteTag();

  const handleChange = (): void => {
    setIsChecked((prev) => !prev);
  };

  const handleDelete = (): void => {
    if (loading) return;
    if (!isChecked) {
      setHasError(true);
      return;
    }

    setHasError(false);
    deleteTag({ variables: { id: tag.id } }).then(onClose);
  };

  const labelHtml = (
    <Text color="gray9" size="component">
      {copy.iUnderstand}
    </Text>
  );

  return (
    <>
      <Header closeModal={closeModal} label={copy.deleteTag} />
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
          {copy.deleteTagConfirm} <b>{tag.name}</b> {copy.deleteTagConfirm2}
        </Text>
        <CheckBox
          checked={isChecked}
          hasError={hasError}
          label={labelHtml}
          onChange={handleChange}
        />
      </ConfirmDelete>
    </>
  );
}
