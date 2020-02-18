import React, { useState } from "react";

function HtmlContentEditable() {
  const [value, setValue] = useState("Edit me!");

  return (
    <div className="container">
      <h3>Native HTML</h3>
      <div
        contentEditable="true"
        data-qa="content-editable"
        onChange={e => setValue(e.target.value)}
        suppressContentEditableWarning
      >
        {value}
      </div>
    </div>
  );
}

export default HtmlContentEditable;
