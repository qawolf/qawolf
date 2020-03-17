import React, { useState } from "react";
import Checkbox from "@material-ui/core/Checkbox";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormGroup from "@material-ui/core/FormGroup";
import FormLabel from "@material-ui/core/FormLabel";

function MaterialUiCheckboxInputs() {
  const [yes, setYes] = useState(false);
  const [color, setColor] = useState({ blue: false, green: false, red: false });

  const handleChange = name => e => {
    setColor({ ...color, [name]: e.target.checked });
  };

  const { blue, green, red } = color;

  return (
    <div className="container">
      <h3>
        <a href="https://github.com/mui-org/material-ui">Material UI</a>
      </h3>
      <FormControl component="fieldset">
        <FormLabel component="legend">Check yes</FormLabel>
        <FormGroup
          name="yes"
          onChange={e => setYes(e.target.checked)}
          value={yes}
        >
          <FormControlLabel
            control={<Checkbox />}
            data-qa="material-checkbox"
            label="Yes"
            value="yes"
          />
        </FormGroup>
      </FormControl>
      <br />
      <br />
      <FormControl component="fieldset">
        <FormLabel component="legend">Favorite color?</FormLabel>
        <FormGroup data-qa="material-checkbox-group">
          <FormControlLabel
            control={
              <Checkbox
                checked={blue}
                id="blue"
                onChange={handleChange("blue")}
                value="blue"
              />
            }
            label="Blue"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={green}
                id="green"
                onChange={handleChange("green")}
                value="green"
              />
            }
            label="Green"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={red}
                id="red"
                onChange={handleChange("red")}
                value="red"
              />
            }
            label="Red"
          />
        </FormGroup>
      </FormControl>
    </div>
  );
}

export default MaterialUiCheckboxInputs;
