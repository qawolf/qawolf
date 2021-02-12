import { Trigger } from "../../../../lib/types";
import EditableText from "../../../shared/EditableText";

type Props = { trigger: Trigger };

const MAX_WIDTH = "320px";

export default function TriggerName({ trigger }: Props): JSX.Element {
  return (
    <EditableText
      bold
      disabled
      maxWidth={MAX_WIDTH}
      onChange={() => null}
      value={trigger.name}
    />
  );
}
