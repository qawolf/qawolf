import React from "react";
import { Editor, EditorState } from "draft-js";
import "draft-js/dist/Draft.css";

function Draftjs() {
  const [editorState, setEditorState] = React.useState(
    EditorState.createEmpty()
  );

  const editor = React.useRef(null);

  function focusEditor() {
    editor.current.focus();
  }

  return (
    <div className="container">
      <h3>
        <a href="https://github.com/facebook/draft-js">Draft.js</a>
      </h3>
      <div data-qa="draftjs" onClick={focusEditor}>
        <Editor
          editorState={editorState}
          onChange={setEditorState}
          ref={editor}
        />
      </div>
    </div>
  );
}

export default Draftjs;
