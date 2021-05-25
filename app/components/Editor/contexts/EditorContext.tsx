import { useRouter } from "next/router";
import { createContext, FC, useContext, useRef } from "react";

import { useTeam } from "../../../hooks/queries";
import { Team } from "../../../lib/types";
import { VersionedMap } from "../../../lib/VersionedMap";
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
    runId?: string;
    state: VersionedMap;
    team?: Team;
    testId?: string;
    testModel?: FileModel;
    testPath?: string;
  };

export const EditorContext = createContext<EditorContextValue>({
  hasChanges: false,
  isLoaded: false,
  isReadOnly: false,
  run: null,
  state: new VersionedMap(),
  suite: null,
});

export const EditorProvider: FC = ({ children }) => {
  const { branch, teamId } = useContext(StateContext);

  const { query } = useRouter();
  const runId = query.run_id as string;
  const testId = query.test_id as string;

  const { current: state } = useRef(new VersionedMap());

  const { data: teamData } = useTeam({ id: teamId });
  const team = teamData?.team || null;

  const { run } = useRun(runId);
  const { suite } = useSuite({ run, team });

  const autoSave = !branch && !runId;

  const { fileModel: helpersModel, isLoaded: isHelpersLoaded } = useFileModel({
    autoSave,
    branch,
    id: `helpers.${teamId}`,
    state,
  });

  const {
    fileModel: testModel,
    isLoaded: isTestLoaded,
    isReadOnly: isTestReadOnly,
    path: testPath,
  } = useFileModel({
    autoSave,
    branch,
    id: runId ? `run.${runId}` : `test.${testId}`,
    state,
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
        // do not allow editing if the test is deleted or for a run
        isReadOnly: isTestReadOnly || !!runId,
        run,
        runId,
        suite,
        state,
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
