import { useRouter } from "next/router";
import { createContext, FC, useContext } from "react";

import { useTeam } from "../../../hooks/queries";
import { Team } from "../../../lib/types";
import { StateContext } from "../../StateContext";
import { CommitChangesHook, useCommitChanges } from "../hooks/commitChanges";
import { useFileModel } from "../hooks/fileModel";
import { RunHook, useRun } from "../hooks/run";
import { SuiteHook, useSuite } from "../hooks/suite";
import { FileModel } from "./FileModel";

type EditorContextValue = CommitChangesHook &
  RunHook &
  SuiteHook & {
    helpersModel?: FileModel;
    isLoaded: boolean;
    isReadOnly: boolean;
    isTestDeleted: boolean;
    runId?: string;
    team?: Team;
    testId?: string;
    testModel?: FileModel;
    testPath?: string;
  };

export const EditorContext = createContext<EditorContextValue>({
  hasChanges: false,
  isLoaded: false,
  isReadOnly: false,
  isTestDeleted: false,
  run: null,
  suite: null,
});

export const EditorProvider: FC = ({ children }) => {
  const { branch, teamId } = useContext(StateContext);

  const { query } = useRouter();
  const runId = query.run_id as string;
  const testId = query.test_id as string;

  const { data: teamData } = useTeam({ id: teamId });
  const team = teamData?.team || null;

  const { run } = useRun(runId);
  const { suite } = useSuite({ run, team });

  const { fileModel: helpersModel, isLoaded: isHelpersLoaded } = useFileModel({
    branch,
    id: `helpers.${teamId}`,
  });

  const {
    fileModel: testModel,
    isLoaded: isTestLoaded,
    isReadOnly: isTestReadOnly,
    path: testPath,
  } = useFileModel({
    branch,
    id: runId ? `run.${runId}` : `test.${testId}`,
  });

  const { commitChanges, hasChanges } = useCommitChanges({
    branch,
    helpersModel,
    testId,
    testModel,
  });

  return (
    <EditorContext.Provider
      value={{
        commitChanges,
        hasChanges,
        helpersModel,
        isLoaded: isHelpersLoaded && isTestLoaded,
        // TODO update to !!file.deleted_at
        isTestDeleted: isTestReadOnly && !runId,
        // TODO update to !!file.deleted_at
        // do not allow editing if the test is deleted or for a run
        isReadOnly: isTestReadOnly || !!runId,
        run,
        runId,
        suite,
        team,
        testId: testId || run?.test_id,
        testModel,
        testPath,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};
