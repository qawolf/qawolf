import React from "react";
import { Editor, EditorState, RichUtils } from "draft-js";
import "draft-js/dist/Draft.css";

function Draftjs() {
  const [editorState, setEditorState] = React.useState(
    EditorState.createEmpty()
  );

  const editor = React.useRef(null);

  function focusEditor() {
    editor.current.focus();
  }

  React.useEffect(() => {
    focusEditor();
  }, []);

  return (
    <div className="container">
      <h3>
        <a href="https://github.com/facebook/draft-js">Draft.js</a>
      </h3>
      <div onClick={focusEditor}>
        <Editor
          ref={editor}
          editorState={editorState}
          onChange={setEditorState}
        />
      </div>
    </div>
  );
}

export default Draftjs;
