import { Box } from "grommet";
import { useRouter } from "next/router";
import { useContext } from "react";

import { routes } from "../../lib/routes";
import { copy } from "../../theme/copy";
import Modal from "../shared/Modal";
import Buttons from "../shared/Modal/Buttons";
import Header from "../shared/Modal/Header";
import Text from "../shared/Text";
import { StateContext } from "../StateContext";

type Props = { closeModal: () => void };

export default function ConfirmBack({ closeModal }: Props): JSX.Element {
  const { push } = useRouter();
  const { dashboardUri } = useContext(StateContext);

  const handlePrimaryClick = (): void => {
    closeModal();
    push(dashboardUri || routes.tests);
  };

  return (
    <Modal a11yTitle="confirm back" closeModal={closeModal}>
      <Box pad="medium">
        <Header closeModal={closeModal} label={copy.uncommittedChangesAlert} />
        <Text
          color="gray9"
          margin={{ top: "xxsmall" }}
          size="componentParagraph"
        >
          {copy.backConfirm}
        </Text>
        <Buttons
          onPrimaryClick={handlePrimaryClick}
          onSecondaryClick={closeModal}
          primaryLabel={copy.goBack}
          secondaryLabel={copy.cancel}
        />
      </Box>
    </Modal>
  );
}
