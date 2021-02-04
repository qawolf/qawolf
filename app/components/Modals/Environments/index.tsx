import { Box } from "grommet";
import Modal from "../../shared-new/Modal";
import Variables from "./Variables";
import Environments from "./Environments";

type Props = { closeModal: () => void };

const width = "800px";

export default function EnvironmentsModal({ closeModal }: Props): JSX.Element {
  return (
    <Modal closeModal={closeModal} width={width}>
      <Box direction="row">
        <Environments />
        <Variables closeModal={closeModal} />
      </Box>
    </Modal>
  );
}
