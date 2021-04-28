import { RiGitCommitLine } from "react-icons/ri";

import { state } from "../../../lib/state";
import { copy } from "../../../theme/copy";
import Button from "../../shared/AppButton";
import Lightning from "../../shared/icons/Lightning";

type Props = {
  branch: string | null;
  hasTriggers: boolean;
  testIds: string[];
};

export default function TestButtons({
  branch,
  hasTriggers,
  testIds,
}: Props): JSX.Element {
  // TODO: update to real value
  const hasChanges = true;

  const handleTriggerClick = (): void => {
    state.setModal({ name: "triggers", testIds });
  };

  return (
    <>
      <Button
        IconComponent={Lightning}
        label={hasTriggers ? copy.editTriggers : copy.addTrigger}
        onClick={handleTriggerClick}
        type={branch ? "secondary" : "primary"}
      />
      {!!branch && (
        <Button
          IconComponent={RiGitCommitLine}
          isDisabled={!hasChanges}
          label={copy.commit}
          margin={{ left: "small" }}
          type="primary"
        />
      )}
    </>
  );
}
