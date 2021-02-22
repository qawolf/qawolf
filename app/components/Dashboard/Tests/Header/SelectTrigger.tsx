import { useRouter } from "next/router";
import { Trigger } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import Select from "../../../shared-new/Select";
import Option from "../../../shared-new/Select/Option";

type Props = {
  triggers: Trigger[];
};

const width = "240px";

export default function SelectTrigger({ triggers }: Props): JSX.Element {
  const { pathname, replace, query } = useRouter();
  const triggerId = query.trigger_id as string;

  const handleAllTriggersClick = (): void => {
    replace(pathname); // clear query
  };

  const handleTriggerClick = (triggerId: string): void => {
    replace(`${pathname}/?trigger_id=${triggerId}`);
  };

  const optionsHtml = triggers.map((t) => {
    return (
      <Option
        isSelected={t.id === triggerId}
        key={t.id}
        label={t.name}
        onClick={() => handleTriggerClick(t.id)}
      />
    );
  });

  const selectedTrigger = triggers.find((t) => t.id === triggerId);
  const label = selectedTrigger?.name || copy.allTriggers;

  return (
    <Select label={label} width={width}>
      <Option
        isSelected={!triggerId}
        label={copy.allTriggers}
        onClick={handleAllTriggersClick}
      />
      {optionsHtml}
    </Select>
  );
}
