import { copy } from "../../../theme/copy";
import ModalHeader from "../../shared/Modal/Header";
import Text from "../../shared/Text";

type Props = { closeModal: () => void };

export default function Header({ closeModal }: Props): JSX.Element {
  return (
    <>
      <ModalHeader closeModal={closeModal} label={copy.triggers} />
      <Text
        color="gray8"
        margin={{ bottom: "medium", top: "xxsmall" }}
        size="componentParagraph"
      >
        {copy.triggersDetail}
      </Text>
    </>
  );
}
