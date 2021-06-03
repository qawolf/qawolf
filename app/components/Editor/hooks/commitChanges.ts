import { useEffect, useState } from "react";

import {
  CommitEditorVariables,
  useCommitEditor,
} from "../../../hooks/mutations";
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
      setHasChanges(
        helpersModel.changed_keys.length + testModel.changed_keys.length > 0
      );

    const unbindHelpersChanged = helpersModel.bind(
      "changed_keys",
      updateHasChanges
    );
    const unbindTestChanged = testModel.bind("changed_keys", updateHasChanges);

    return () => {
      unbindHelpersChanged();
      unbindTestChanged();
    };
  }, [branch, helpersModel, testModel]);

  const commitChanges = async (): Promise<void> => {
    if (!branch || !helpersModel || !testModel) return;

    const variables: CommitEditorVariables = { branch, test_id: testId };

    if (testModel.changed_keys.includes("content")) {
      variables.code = testModel.content;
    }

    if (testModel.changed_keys.includes("path")) {
      variables.path = testModel.path;
    }

    if (helpersModel.changed_keys.includes("content")) {
      variables.helpers = helpersModel.content;
    }

    if (Object.keys(variables).length < 3) return;

    await commitEditor({ variables });

    helpersModel.reload();
    testModel.reload();
  };

  return { commitChanges, hasChanges };
};
