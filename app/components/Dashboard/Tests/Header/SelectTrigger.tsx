import { useRouter } from "next/router";

import { TestTriggers, Trigger } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import Divider from "../../../shared-new/Divider";
import Select from "../../../shared-new/Select";
import { noTriggerId } from "../../helpers";
import TriggerOption from "./TriggerOption";

type Props = {
  testTriggers: TestTriggers[];
  triggers: Trigger[];
};

const dividerProps = { margin: { vertical: "xxxsmall" } };
const width = "320px";

export default function SelectTrigger({
  testTriggers,
  triggers,
}: Props): JSX.Element {
  const { pathname, replace, query } = useRouter();
  const triggerId = query.trigger_id as string;

  const handleAllTriggersClick = (): void => {
    replace(pathname); // clear query
  };

  const handleTriggerClick = (triggerId: string): void => {
    replace(`${pathname}/?trigger_id=${triggerId}`);
  };

  const optionsHtml = triggers.map((trigger) => {
    const count = testTriggers.filter((t) => t.trigger_ids.includes(trigger.id))
      .length;

    return (
      <TriggerOption
        count={count}
        isSelected={trigger.id === triggerId}
        key={trigger.id}
        onClick={() => handleTriggerClick(trigger.id)}
        trigger={trigger}
      />
    );
  });

  const selectedTrigger = triggers.find((t) => t.id === triggerId);

  const label =
    selectedTrigger?.name ||
    (triggerId === noTriggerId ? copy.noTrigger : copy.allTriggers);

  const noTriggerCount = testTriggers.filter((t) => !t.trigger_ids.length)
    .length;

  return (
    <Select flex={false} label={label} width={width}>
      <TriggerOption
        count={testTriggers.length}
        isSelected={!triggerId}
        label={copy.allTriggers}
        onClick={handleAllTriggersClick}
      />
      {!!optionsHtml.length && <Divider {...dividerProps} />}
      {optionsHtml}
      <Divider {...dividerProps} />
      <TriggerOption
        count={noTriggerCount}
        isSelected={triggerId === "none"}
        label={copy.noTrigger}
        onClick={() => handleTriggerClick(noTriggerId)}
      />
    </Select>
  );
}
