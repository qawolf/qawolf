import { Box, ThemeContext } from "grommet";
import { ChangeEvent, useEffect, useState } from "react";

import { useDeleteTests } from "../../hooks/mutations";
import { SelectedTest } from "../../lib/types";
import { copy } from "../../theme/copy";
import { theme } from "../../theme/theme-new";
import TextInput from "../shared-new/AppTextInput";
import Modal from "../shared-new/Modal";
import ConfirmDelete from "../shared-new/Modal/ConfirmDelete";
import Header from "../shared-new/Modal/Header";
import Text from "../shared-new/Text";

type Props = {
  closeModal: () => void;
  tests: SelectedTest[];
};

export default function ConfirmDeleteTests({
  closeModal,
  tests,
}: Props): JSX.Element {
  const [error, setError] = useState("");
  const [value, setValue] = useState("");

  const testIds = tests.map((test) => test.id);
  const [deleteTests, { loading }] = useDeleteTests({ ids: testIds });

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setValue(e.target.value);
  };

  const handleDelete = (): void => {
    if (value !== copy.confirm) {
      setError(copy.mustMatch);
      return;
    }

    setError("");
    deleteTests().then(closeModal);
  };

  const testNames = tests.map((test) => test.name).join(", ");

  return (
    <ThemeContext.Extend value={theme}>
      <Modal a11yTitle="delete test modal" closeModal={closeModal}>
        <Box pad="medium">
          <Header closeModal={closeModal} label={copy.deleteTests} />
          <ConfirmDelete
            isDeleteDisabled={loading}
            onCancel={closeModal}
            onDelete={handleDelete}
          >
            <Text
              color="gray9"
              margin={{ top: "xxsmall" }}
              size="componentParagraph"
            >
              {copy.confirmDelete("tests")} {copy.pleaseType}{" "}
              <b>{copy.confirm}</b> {copy.environmentDeleteConfirm2}
            </Text>
            <Text
              color="gray9"
              margin={{ vertical: "medium" }}
              size="componentBold"
            >
              {testNames}
            </Text>
            <TextInput
              autoFocus
              error={error}
              onChange={handleChange}
              placeholder={copy.confirm}
              value={value}
            />
          </ConfirmDelete>
        </Box>
      </Modal>
    </ThemeContext.Extend>
  );
}
