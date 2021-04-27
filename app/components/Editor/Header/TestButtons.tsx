import { state } from "../../../lib/state";
import { copy } from "../../../theme/copy";
import Button from "../../shared/AppButton";
import Lightning from "../../shared/icons/Lightning";

type Props = {
  hasTriggers: boolean;
  testIds: string[];
};

export default function TestButtons({
  hasTriggers,
  testIds,
}: Props): JSX.Element {
  const handleTriggerClick = (): void => {
    state.setModal({ name: "triggers", testIds });
  };

  return (
    <Button
      IconComponent={Lightning}
      label={hasTriggers ? copy.editTriggers : copy.addTrigger}
      onClick={handleTriggerClick}
      type="primary"
    />
  );
}
