import React, { useState } from "react";
import DateFnsUtils from "@date-io/date-fns";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider
} from "@material-ui/pickers";
import TextField from "@material-ui/core/TextField";

function MaterialUiDatePickers() {
  const [birthday, setBirthday] = useState(new Date("2014-08-18"));
  const [favorite, setFavorite] = useState(new Date("2001-01-1"));

  return (
    <div className="container">
      <h3>
        <a href="https://github.com/mui-org/material-ui">Material UI</a>
      </h3>
      <TextField
        data-qa="material-date-picker-native"
        defaultValue="1990-06-27"
        label="Birthday"
        type="date"
      />
      <br />
      <br />
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <KeyboardDatePicker
          data-qa="material-date-picker"
          disableToolbar
          format="MM/dd/yyyy"
          KeyboardButtonProps={{
            "aria-label": "change date"
          }}
          label="Birthday"
          margin="normal"
          onChange={setBirthday}
          value={birthday}
          variant="inline"
        />
        <br />
        <br />
        <KeyboardDatePicker
          data-qa="material-date-picker-dialog"
          format="MM/dd/yyyy"
          KeyboardButtonProps={{
            "aria-label": "change date"
          }}
          label="Favorite Day"
          margin="normal"
          onChange={setFavorite}
          value={favorite}
        />
      </MuiPickersUtilsProvider>
    </div>
  );
}

export default MaterialUiDatePickers;
