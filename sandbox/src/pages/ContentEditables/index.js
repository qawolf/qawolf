import React from "react";
import Draftjs from "./Draftjs";
import Quill from "./Quill";

function ContentEditables() {
  return (
    <React.Fragment>
      <Draftjs />
      <Quill />
    </React.Fragment>
  );
}

export default ContentEditables;
