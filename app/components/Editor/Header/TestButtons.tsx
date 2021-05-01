import { useContext, useState } from "react";
import { RiGitCommitLine } from "react-icons/ri";

import { state } from "../../../lib/state";
import { copy } from "../../../theme/copy";
import Button from "../../shared/AppButton";
import Lightning from "../../shared/icons/Lightning";
import { TestContext } from "../contexts/TestContext";

type Props = {
  branch: string | null;
  hasTriggers: boolean;
  testId: string;
};

export default function TestButtons({
  branch,
  hasTriggers,
  testId,
}: Props): JSX.Element {
  const { hasChanges, controller } = useContext(TestContext);
  const [loading, setLoading] = useState(false);

  const handleCommitClick = async (): Promise<void> => {
    setLoading(true);
    await controller.save();
    setLoading(false);
  };

  const handleTriggerClick = (): void => {
    state.setModal({ name: "triggers", testIds: [testId] });
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
          isDisabled={!hasChanges || loading}
          label={copy.commit}
          margin={{ left: "small" }}
          onClick={handleCommitClick}
          type="primary"
        />
      )}
    </>
  );
}
