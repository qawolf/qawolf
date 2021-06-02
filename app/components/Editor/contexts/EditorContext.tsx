import { useRouter } from "next/router";
import { createContext, FC, useContext, useEffect, useState } from "react";

import { useTeam } from "../../../hooks/queries";
import { Team } from "../../../lib/types";
import { StateContext } from "../../StateContext";
import { CommitChangesHook, useCommitChanges } from "../hooks/commitChanges";
import { defaultFileState, FileState, useFileModel } from "../hooks/fileModel";
import { RunHook, useRun } from "../hooks/run";
import { SuiteHook, useSuite } from "../hooks/suite";
import { UserAwareness } from "../hooks/useUserAwareness";
import { FileModel } from "./FileModel";

type EditorContextValue = CommitChangesHook &
  RunHook &
  SuiteHook & {
    helpers: FileState;
    helpersModel?: FileModel;
    isLoaded: boolean;
    runId?: string;
    team?: Team;
    testId?: string;
    test: FileState;
    testModel?: FileModel;
    userAwareness?: UserAwareness;
  };

export const EditorContext = createContext<EditorContextValue>({
  hasChanges: false,
  helpers: defaultFileState,
  isLoaded: false,
  run: null,
  test: defaultFileState,
  suite: null,
});

export const EditorProvider: FC = ({ children }) => {
  const { branch, teamId } = useContext(StateContext);

  const { query } = useRouter();
  const runId = query.run_id as string;
  const testId = query.test_id as string;

  const [userAwareness, setUserAwareness] = useState<UserAwareness>();

  const { data: teamData } = useTeam({ id: teamId });
  const team = teamData?.team || null;

  const { run } = useRun(runId);
  const { suite } = useSuite({ run, team });

  const branchPart = branch ? `.${branch}` : "";

  const { file: helpers, model: helpersModel } = useFileModel(
    runId ? `runhelpers.${suite?.id}` : `helpers.${teamId}${branchPart}`
  );

  const { file: test, model: testModel } = useFileModel(
    runId ? `run.${runId}` : `test.${testId}${branchPart}`
  );

  const { commitChanges, hasChanges } = useCommitChanges({
    branch,
    helpersModel,
    testId,
    testModel,
  });

  useEffect(() => {
    if (!testModel || !test.isInitialized) return;
    setUserAwareness(new UserAwareness(testModel._provider.awareness));
    return () => setUserAwareness(null);
  }, [test.isInitialized, testModel]);

  return (
    <EditorContext.Provider
      value={{
        commitChanges,
        hasChanges,
        helpers,
        helpersModel,
        isLoaded: helpers.isLoaded && test.isLoaded,
        run,
        runId,
        suite,
        team,
        test,
        testId: testId || run?.test_id,
        testModel,
        userAwareness,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};
