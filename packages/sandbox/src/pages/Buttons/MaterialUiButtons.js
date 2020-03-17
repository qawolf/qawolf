import React from "react";
import Button from "@material-ui/core/Button";

function MaterialUiButtons() {
  return (
    <div className="container">
      <h3>
        <a href="https://github.com/mui-org/material-ui">Material UI</a>
      </h3>
      <Button color="primary" data-qa="material-button" variant="contained">
        Primary
      </Button>
    </div>
  );
}

export default MaterialUiButtons;
