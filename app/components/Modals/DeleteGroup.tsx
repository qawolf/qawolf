import { Box, ThemeContext } from "grommet";
import { ChangeEvent, useState } from "react";

import { useDeleteGroup } from "../../hooks/mutations";
import { MutableListFields } from "../../lib/types";
import { copy } from "../../theme/copy";
import { theme } from "../../theme/theme-new";
import TextInput from "../shared-new/AppTextInput";
import Modal from "../shared-new/Modal";
import ConfirmDelete from "../shared-new/Modal/ConfirmDelete";
import Header from "../shared-new/Modal/Header";
import Text from "../shared-new/Text";

type Props = {
  closeModal: () => void;
  group: MutableListFields;
};

export default function DeleteGroup({ closeModal, group }: Props): JSX.Element {
  const [error, setError] = useState("");
  const [value, setValue] = useState("");

  const [deleteGroup, { loading }] = useDeleteGroup();

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setValue(e.target.value);
  };

  const handleDelete = (): void => {
    if (value.toLowerCase() !== group.name.toLowerCase()) {
      setError(copy.mustMatch);
      return;
    }

    setError("");
    deleteGroup({ variables: { id: group.id } }).then(closeModal);
  };

  return (
    <ThemeContext.Extend value={theme}>
      <Modal a11yTitle="delete group modal" closeModal={closeModal}>
        <Box pad="medium">
          <Header closeModal={closeModal} label={copy.groupDelete} />
          <ConfirmDelete
            isDeleteDisabled={loading}
            onCancel={closeModal}
            onDelete={handleDelete}
          >
            <Text
              color="gray9"
              margin={{ bottom: "medium", top: "xxsmall" }}
              size="componentParagraph"
            >
              {copy.groupDeleteConfirm} <b>{group.name}</b>{" "}
              {copy.groupDeleteConfirm2}
            </Text>
            <TextInput
              autoFocus
              error={error}
              onChange={handleChange}
              placeholder={group.name}
              value={value}
            />
          </ConfirmDelete>
        </Box>
      </Modal>
    </ThemeContext.Extend>
  );
}
