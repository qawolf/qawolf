import { copy } from "../../../theme/copy";
import Modal from "../../shared-new/Modal";
import Text from "../../shared-new/Text";
import SelectEnvironment from "./SelectEnvironment";
import List from "./List";

type Props = {
  closeModal: () => void;
};

export default function Environments({ closeModal }: Props): JSX.Element {
  return (
    <Modal closeModal={closeModal} label={copy.envVariables}>
      <Text color="gray9" margin={{ top: "xxsmall" }} size="componentParagraph">
        {copy.envVariablesDetail}
      </Text>
      <SelectEnvironment />
      <List closeModal={closeModal} />
    </Modal>
  );
}
