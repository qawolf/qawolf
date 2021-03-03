import { copy } from "../../../theme/copy";
import ModalHeader from "../../shared-new/Modal/Header";
import Text from "../../shared-new/Text";

type Props = {
  closeModal: () => void;
  testCount: number;
};

export default function Header({ closeModal, testCount }: Props): JSX.Element {
  return (
    <>
      <ModalHeader
        closeModal={closeModal}
        label={testCount ? copy.editTriggersForTests(testCount) : copy.triggers}
      />
      <Text
        color="gray8"
        margin={{ bottom: "medium", top: "xxsmall" }}
        size="componentParagraph"
      >
        {testCount ? copy.editTriggersDetail : copy.triggersDetail}
      </Text>
    </>
  );
}
