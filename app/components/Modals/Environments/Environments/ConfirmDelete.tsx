import { Box } from "grommet";
import { ChangeEvent, useEffect, useRef, useState } from "react";

import { useDeleteEnvironment } from "../../../../hooks/mutations";
import { Environment } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import TextInput from "../../../shared-new/AppTextInput";
import ConfirmDelete from "../../../shared-new/Modal/ConfirmDelete";
import Header from "../../../shared-new/Modal/Header";
import Text from "../../../shared-new/Text";

type Props = {
  closeModal: () => void;
  environment: Environment;
  onClose: (deletedEnvironmentId?: string) => void;
};

export default function ConfirmDeleteEnvironment({
  closeModal,
  environment,
  onClose,
}: Props): JSX.Element {
  const [error, setError] = useState("");
  const [name, setName] = useState("");

  const ref = useRef<HTMLInputElement>(null);

  // focus text input
  useEffect(() => {
    if (ref.current) ref.current.focus();
  }, []);

  const [deleteEnvironment, { loading }] = useDeleteEnvironment();

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setName(e.target.value);
  };

  const handleDelete = (): void => {
    if (name !== environment.name) {
      setError(copy.mustMatch);
      return;
    }

    setError("");
    deleteEnvironment({ variables: { id: environment.id } }).then(
      ({ data }) => {
        onClose(data?.deleteEnvironment.id);
      }
    );
  };

  return (
    <Box pad="medium">
      <Header closeModal={closeModal} label={copy.environmentDelete} />
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
          {copy.environmentDeleteConfirm} <b>{environment.name}</b>{" "}
          {copy.environmentDeleteConfirm2}
        </Text>
        <TextInput
          error={error}
          onChange={handleChange}
          placeholder={environment.name}
          ref={ref}
          value={name}
        />
      </ConfirmDelete>
    </Box>
  );
}
