import React from "react";
import Draftjs from "./Draftjs";
import HtmlContentEditable from "./HtmlContentEditable";
import Quill from "./Quill";

function ContentEditables() {
  return (
    <React.Fragment>
      <HtmlContentEditable />
      <Draftjs />
      <Quill />
    </React.Fragment>
  );
}

export default ContentEditables;
