import React from "react";
import TextField from "@material-ui/core/TextField";

function MaterialUiTextInputs() {
  return (
    <div className="container">
      <h3>
        <a href="https://github.com/mui-org/material-ui">Material UI</a>
      </h3>
      <TextField data-qa="material-text-input" label="Text input" />
      <br />
      <br />
      <TextField
        data-qa="material-text-input-filled"
        defaultValue="initial value"
        label="Filled text input"
      />
      <br />
      <br />
      <TextField
        data-qa="material-password-input"
        label="Password input"
        type="password"
      />
      <br />
      <br />
      <TextField
        data-qa="material-number-input"
        label="Number input"
        type="number"
      />
      <br />
      <br />
      <TextField data-qa="material-textarea" label="Textarea" multiline />
    </div>
  );
}

export default MaterialUiTextInputs;
