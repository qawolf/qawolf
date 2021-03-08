import { Box } from "grommet";

import { useDeleteGroup } from "../../hooks/mutations";
import { useOnHotKey } from "../../hooks/onHotKey";
import { MutableListFields } from "../../lib/types";
import { copy } from "../../theme/copy";
import Modal from "../shared-new/Modal";
import Buttons from "../shared-new/Modal/Buttons";
import Header from "../shared-new/Modal/Header";
import Text from "../shared-new/Text";

type Props = {
  closeModal: () => void;
  group: MutableListFields;
};

export default function DeleteGroup({ closeModal, group }: Props): JSX.Element {
  const [deleteGroup, { loading }] = useDeleteGroup();

  const handleDelete = (): void => {
    deleteGroup({ variables: { id: group.id } }).then(closeModal);
  };

  useOnHotKey({ hotKey: "Enter", onHotKey: handleDelete });

  return (
    <Modal a11yTitle="delete group modal" closeModal={closeModal}>
      <Box pad="medium">
        <Header closeModal={closeModal} label={copy.groupDelete} />
        <Text
          color="gray9"
          margin={{ top: "xxsmall" }}
          size="componentParagraph"
        >
          {copy.groupDeleteConfirm}
        </Text>
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
