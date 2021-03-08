import { Box, Button } from "grommet";
import { useRef, useState } from "react";

import { useDeleteTests } from "../../hooks/mutations";
import { useOnHotKey } from "../../hooks/onHotKey";
import { SelectedTest } from "../../lib/types";
import { copy } from "../../theme/copy";
import CheckBox from "../shared/CheckBox";
import Modal from "../shared/Modal";
import Buttons from "../shared/Modal/Buttons";
import Header from "../shared/Modal/Header";
import Text from "../shared/Text";

type Props = {
  closeModal: () => void;
  tests: SelectedTest[];
};

export default function DeleteTests({ closeModal, tests }: Props): JSX.Element {
  const ref = useRef<HTMLButtonElement>(null);

  const [hasError, setHasError] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const testIds = tests.map((test) => test.id);
  const [deleteTests, { loading }] = useDeleteTests({ ids: testIds });

  const handleClick = (): void => {
    setHasError(false);
    setIsChecked((prev) => !prev);
    // prevents enter press from toggling checkbox
    ref.current?.blur();
  };

  const handleDelete = (): void => {
    if (!isChecked) {
      setHasError(true);
      return;
    }

    setHasError(false);
    deleteTests().then(closeModal);
  };

  useOnHotKey({ hotKey: "Enter", onHotKey: handleDelete });

  return (
    <Modal a11yTitle="delete test modal" closeModal={closeModal}>
      <Box pad="medium">
        <Header
          closeModal={closeModal}
          label={copy.deleteTests(tests.length)}
        />
        <Text
          color="gray9"
          margin={{ bottom: "medium", top: "xxsmall" }}
          size="componentParagraph"
        >
          {copy.deleteTestsDetail}
        </Text>
        <Button
          a11yTitle="confirm delete"
          onClick={handleClick}
          plain
          ref={ref}
        >
          <Box align="center" direction="row" width="120px">
            <CheckBox checked={isChecked} hasError={hasError} />
            <Text color="gray9" margin={{ left: "xxsmall" }} size="component">
              {copy.iUnderstand}
            </Text>
          </Box>
        </Button>
        <Buttons
          onPrimaryClick={handleDelete}
          onSecondaryClick={closeModal}
          primaryIsDisabled={loading}
          primaryLabel={copy.delete}
          primaryType="danger"
          secondaryLabel={copy.cancel}
        />
      </Box>
    </Modal>
  );
}
