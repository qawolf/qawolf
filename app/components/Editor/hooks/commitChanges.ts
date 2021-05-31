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

    const updateHasChanges = () => {
      // XXX
      // const changes = helpersModel.changes() || testModel.changes();
      setHasChanges(false);
    };

    helpersModel.on("changed", updateHasChanges);
    testModel.on("changed", updateHasChanges);

    updateHasChanges();

    return () => {
      helpersModel.off("changed", updateHasChanges);
      testModel.off("changed", updateHasChanges);
    };
  }, [branch, helpersModel, testModel]);

  const commitChanges = async (): Promise<void> => {
    if (!branch || !helpersModel || !testModel) return;

    const variables: CommitEditorVariables = { branch, test_id: testId };

    // const testChanges = testModel.changes();
    // if (testChanges) {
    //   if (!isNil(testChanges.content)) variables.code = testChanges.content;
    //   if (!isNil(testChanges.path)) variables.path = testChanges.path;
    // }

    // const helpersChanges = helpersModel.changes();
    // if (helpersChanges && !isNil(helpersChanges.content)) {
    //   variables.helpers = helpersChanges.content;
    // }

    if (Object.keys(variables).length < 3) return;

    await commitEditor({ variables });
  };

  return { commitChanges, hasChanges };
};
