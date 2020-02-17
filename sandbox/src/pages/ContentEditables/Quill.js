import React from "react";

function Quill() {
  return (
    <div className="container">
      <h3>
        <a href="https://github.com/quilljs/quill">Quill</a>
      </h3>
      <div id="editor">
        <p>Hello World!</p>
        <p>
          Some initial <strong>bold</strong> text
        </p>
      </div>
    </div>
  );
}

export default Quill;
