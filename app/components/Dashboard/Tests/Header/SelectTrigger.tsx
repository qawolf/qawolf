import { Trigger } from "../../../../lib/types";
import Select from "../../../shared-new/Select";
import Option from "../../../shared-new/Select/Option";

type Props = {
  triggers: Trigger[];
};

export default function SelectTrigger({ triggers }: Props): JSX.Element {
  return <Select></Select>;
}
