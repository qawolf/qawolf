import { Box, ThemeContext } from "grommet";
import { copy } from "../../theme/copy";

import { theme } from "../../theme/theme-new";
import Modal from "../shared-new/Modal";
import Header from "../shared-new/Modal/Header";

type Props = { closeModal: () => void };

export default function CreateTest({ closeModal }: Props): JSX.Element {
  return (
    <ThemeContext.Extend value={theme}>
      <Modal closeModal={closeModal}>
        <Box pad="medium">
          <Header closeModal={closeModal} label={copy.enterUrl} />
        </Box>
      </Modal>
    </ThemeContext.Extend>
  );
}
