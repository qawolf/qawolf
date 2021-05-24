import { useRouter } from "next/router";
import {
  createContext,
  FC,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { useEditor } from "../../../hooks/queries";
import { VersionedMap } from "../../../lib/VersionedMap";
import { StateContext } from "../../StateContext";
import { useFileModel } from "../hooks/fileModel";
import { FileModel } from "./FileModel";

type EditorContextValue = {
  commitEditor: () => Promise<void>;
  hasChanges: boolean;
  helpersModel?: FileModel;
  state: VersionedMap;
  testModel?: FileModel;
};

export const EditorContext = createContext<EditorContextValue>({
  commitEditor: async () => {},
  hasChanges: false,
  state: new VersionedMap(),
});

export const EditorProvider: FC = ({ children }) => {
  const { branch, teamId } = useContext(StateContext);
  const { current: state } = useRef(new VersionedMap());

  const [hasChanges, setHasChanges] = useState(false);

  const { query } = useRouter();
  const run_id = query.run_id as string;
  const test_id = query.test_id as string;

  const { data } = useEditor({ branch, run_id, test_id }, { teamId });
  const editor = data?.editor || null;

  const { fileModel: helpersModel } = useFileModel({
    autoSave: !branch,
    id: `helpers.${teamId}`,
    editor,
    state,
  });

  const { fileModel: testModel } = useFileModel({
    autoSave: !branch,
    id: run_id ? `run.${run_id}` : `test.${test_id}`,
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
      value={{ commitEditor, hasChanges, helpersModel, state, testModel }}
    >
      {children}
    </EditorContext.Provider>
  );
};
