import { useRouter } from "next/router";
import {
  createContext,
  FC,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { useEditor, useTeam } from "../../../hooks/queries";
import { Run, Suite, Team } from "../../../lib/types";
import { VersionedMap } from "../../../lib/VersionedMap";
import { StateContext } from "../../StateContext";
import { useFileModel } from "../hooks/fileModel";
import { useRun } from "../hooks/run";
import { useSuite } from "../hooks/suite";
import { FileModel } from "./FileModel";

type EditorContextValue = {
  commitEditor?: () => Promise<void>;
  hasChanges: boolean;
  helpersModel?: FileModel;
  isHelpersReadOnly: boolean;
  isLoaded: boolean;
  isTestReadOnly: boolean;
  run: Run | null;
  runId?: string;
  suite: Suite | null;
  state: VersionedMap;
  team?: Team;
  testId?: string;
  testModel?: FileModel;
  testPath?: string;
};

export const EditorContext = createContext<EditorContextValue>({
  hasChanges: false,
  isHelpersReadOnly: true,
  isLoaded: false,
  isTestReadOnly: true,
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
  const [hasChanges, setHasChanges] = useState(false);

  const { data, loading } = useEditor(
    { branch, run_id: runId, test_id: testId },
    { teamId }
  );
  const editor = data?.editor || null;

  const { data: teamData } = useTeam({ id: teamId });
  const team = teamData?.team || null;

  const { run } = useRun({ branch, runId, teamId });
  const { suite } = useSuite({ run, team });

  const {
    fileModel: helpersModel,
    isReadOnly: isHelpersReadOnly,
  } = useFileModel({
    autoSave: !branch,
    id: `helpers.${teamId}`,
    editor,
    state,
  });

  const {
    fileModel: testModel,
    isReadOnly: isTestReadOnly,
    path: testPath,
  } = useFileModel({
    autoSave: !branch,
    id: runId ? `run.${runId}` : `test.${testId}`,
    editor,
    state,
  });

  useEffect(() => {
    if (!helpersModel || !testModel) return;

    const updateHasChanges = () => {
      const changes = helpersModel.changes() || testModel.changes();
      setHasChanges(!!changes);
    };

    helpersModel.on("change", updateHasChanges);
    testModel.on("change", updateHasChanges);

    return () => {
      helpersModel.off("change", updateHasChanges);
      testModel.off("change", updateHasChanges);
    };
  }, [helpersModel, testModel]);

  const commitEditor = async () => {
    if (!branch) return;

    // TODO useMutation commitChanges
    // const test_id = this._value?.test.id;
    // if (!test_id) return;
    // const changes = this.getChanges();
    // if (!changes) return;
    // await client.mutate({
    //   mutation: saveEditorMutation,
    //   variables: { ...changes, branch: this._branch, test_id },
    // });
  };

  return (
    <EditorContext.Provider
      value={{
        commitEditor,
        hasChanges,
        helpersModel,
        isHelpersReadOnly,
        // only consider the test loading the first time it loads (when there is no test data)
        // this prevents the loading placeholder from flashing every poll
        // TODO update this for 2 queries
        isLoaded: !data && loading,
        isTestReadOnly,
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
