import React, { useState } from "react";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormLabel from "@material-ui/core/FormLabel";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";

function MaterialUiRadioInputs() {
  const [yes, setYes] = useState("");
  const [color, setColor] = useState("");

  return (
    <div className="container">
      <h3>
        <a href="https://github.com/mui-org/material-ui">Material UI</a>
      </h3>
      <FormControl component="fieldset">
        <FormLabel component="legend">Check yes</FormLabel>
        <RadioGroup
          name="yes"
          onChange={e => setYes(e.target.value)}
          value={yes}
        >
          <FormControlLabel
            control={<Radio />}
            data-qa="material-radio"
            label="Yes"
            value="yes"
          />
        </RadioGroup>
      </FormControl>
      <br />
      <br />
      <FormControl component="fieldset">
        <FormLabel component="legend">Favorite color?</FormLabel>
        <RadioGroup
          data-qa="material-radio-group"
          name="color"
          onChange={e => setColor(e.target.value)}
          value={color}
        >
          <FormControlLabel
            control={<Radio id="blue" />}
            label="Blue"
            value="blue"
          />
          <FormControlLabel control={<Radio />} label="Green" value="green" />
          <FormControlLabel control={<Radio />} label="Red" value="red" />
        </RadioGroup>
      </FormControl>
    </div>
  );
}

export default MaterialUiRadioInputs;
