import Modal from "../../shared-new/Modal";

type Props = {
  closeModal: () => void;
};

export default function Environments({ closeModal }: Props): JSX.Element {
  return (
    <Modal closeModal={closeModal}>
      <h1>todo</h1>
    </Modal>
  );
}
