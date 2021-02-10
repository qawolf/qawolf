import { copy } from "../../../theme/copy";
import Header from "../../shared-new/Modal/Header";

type Props = { closeModal: () => void };

export default function CreateTrigger({ closeModal }: Props): JSX.Element {
  return <Header closeModal={closeModal} label={copy.createTrigger} />;
}
