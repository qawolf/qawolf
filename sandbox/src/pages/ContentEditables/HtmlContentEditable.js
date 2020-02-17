import React from "react";

function HtmlContentEditable() {
  return (
    <div className="container">
      <h3>Native HTML</h3>
      <div contenteditable="true">Edit me!</div>
    </div>
  );
}

export default HtmlContentEditable;
