import React, { useState } from "react";
import DateFnsUtils from "@date-io/date-fns";
import TextField from "@material-ui/core/TextField";
import {
  KeyboardTimePicker,
  MuiPickersUtilsProvider
} from "@material-ui/pickers";

function MaterialUiTimePickers() {
  const [time, setTime] = useState(new Date("2014-08-18T12:00:00"));
  return (
    <div className="container">
      <h3>
        <a href="https://github.com/mui-org/material-ui">Material UI</a>
      </h3>
      <TextField
        data-qa="material-time-picker-native"
        defaultValue="07:30"
        inputProps={{
          step: 300 // 5 min
        }}
        label="Alarm clock"
        type="time"
      />
      <br />
      <br />
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <KeyboardTimePicker
          data-qa="material-time-picker"
          KeyboardButtonProps={{
            "aria-label": "change time"
          }}
          label="Lunch"
          onChange={setTime}
          value={time}
        />
      </MuiPickersUtilsProvider>
    </div>
  );
}

export default MaterialUiTimePickers;
