import { useRouter } from "next/router";
import { createContext, FC, useContext, useRef } from "react";

import { useEditor } from "../../../hooks/queries";
import { VersionedMap } from "../../../lib/VersionedMap";
import { StateContext } from "../../StateContext";
import { useFileModel } from "../hooks/fileModel";
import { FileModel } from "./FileModel";

type EditorContextValue = {
  helpersModel: FileModel;
  state: VersionedMap;
  testModel: FileModel;
};

export const EditorContext = createContext<EditorContextValue>({
  helpersModel: new FileModel(null),
  state: new VersionedMap(),
  testModel: new FileModel(null),
});

export const EditorProvider: FC = ({ children }) => {
  const { current: state } = useRef(new VersionedMap());

  const { branch, teamId } = useContext(StateContext);

  const { query } = useRouter();
  const run_id = query.run_id as string;
  const test_id = query.test_id as string;
  const { data } = useEditor({ branch, run_id, test_id }, { teamId });
  const editor = data?.editor || null;

  const { fileModel: helpersModel } = useFileModel({
    id: `helpers.${teamId}`,
    editor,
    state,
  });

  const { fileModel: testModel } = useFileModel({
    id: run_id ? `run.${run_id}` : `test.${test_id}`,
    editor,
    state,
  });

  return (
    <EditorContext.Provider value={{ helpersModel, state, testModel }}>
      {children}
    </EditorContext.Provider>
  );
};
