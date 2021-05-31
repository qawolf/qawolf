import { useEffect, useState } from "react";

import { useCommitEditor } from "../../../hooks/mutations";
import { FileModel } from "../contexts/FileModel";

export type CommitChangesHook = {
  commitChanges?: () => Promise<void>;
  hasChanges: boolean;
};

type UseCommitChanges = {
  branch?: string;
  helpersModel: FileModel;
  testId: string;
  testModel: FileModel;
};

export const useCommitChanges = ({
  branch,
  helpersModel,
  testId,
  testModel,
}: UseCommitChanges): CommitChangesHook => {
  const [hasChanges, setHasChanges] = useState(false);
  const [commitEditor] = useCommitEditor();

  useEffect(() => {
    if (!branch || !helpersModel || !testModel) return;

    const updateHasChanges = () =>
      setHasChanges(helpersModel.has_changes || testModel.has_changes);

    const unbindHelpers = helpersModel.bind("has_changes", updateHasChanges);
    const unbindTest = testModel.bind("has_changes", updateHasChanges);

    return () => {
      unbindHelpers();
      unbindTest();
    };
  }, [branch, helpersModel, testModel]);

  const commitChanges = async (): Promise<void> => {
    if (!branch || !helpersModel || !testModel) return;

    await commitEditor({
      variables: {
        branch,
        code: testModel.content,
        helpers: helpersModel.content,
        path: testModel.path,
        test_id: testId,
      },
    });

    helpersModel.reload();
    testModel.reload();
  };

  return { commitChanges, hasChanges };
};
