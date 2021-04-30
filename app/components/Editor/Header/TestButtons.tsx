import { RiGitCommitLine } from "react-icons/ri";

import { useSaveEditor } from "../../../hooks/mutations";
import { state } from "../../../lib/state";
import { copy } from "../../../theme/copy";
import Button from "../../shared/AppButton";
import Lightning from "../../shared/icons/Lightning";

type Props = {
  branch: string | null;
  hasChanges: boolean;
  hasTriggers: boolean;
  testId: string;
};

export default function TestButtons({
  branch,
  hasChanges,
  hasTriggers,
  testId,
}: Props): JSX.Element {
  const [saveEditor, { loading }] = useSaveEditor();

  const handleCommitClick = (): void => {
    saveEditor({
      variables: {
        branch,
        code: "// new code",
        // helpers: "// helpers edited",
        path: "qawolf/random213.test.js",
        test_id: testId,
      },
    });
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
