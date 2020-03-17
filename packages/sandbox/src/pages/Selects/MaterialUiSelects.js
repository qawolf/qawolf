import React, { useState } from "react";
import FormControl from "@material-ui/core/FormControl";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import NativeSelect from "@material-ui/core/NativeSelect";
import Select from "@material-ui/core/Select";

const names = [
  "Arya Stark",
  "Daenerys Targaryen",
  "Jaime Lannister",
  "Jon Snow",
  "Sansa Stark"
];

function MaterialUiSelects() {
  const [pet, setPet] = useState("");
  const [color, setColor] = useState("");
  const [personName, setPersonName] = React.useState([]);

  const handleChange = event => {
    setPersonName(event.target.value);
  };

  return (
    <div className="container">
      <h3>
        <a href="https://github.com/mui-org/material-ui">Material UI</a>
      </h3>
      <FormControl style={{ minWidth: "140px" }}>
        <InputLabel htmlFor="material-select" id="label">
          Best pet?
        </InputLabel>
        <Select
          data-qa="material-select"
          id="material-select"
          labelId="label"
          onChange={e => setPet(e.target.value)}
          value={pet}
        >
          <MenuItem value="cat">Cat</MenuItem>
          <MenuItem value="dog">Dog</MenuItem>
          <MenuItem value="hedgehog">Hedgehog</MenuItem>
        </Select>
      </FormControl>
      <br />
      <br />
      <FormControl style={{ minWidth: "140px" }}>
        <InputLabel htmlFor="material-select-native">
          Favorite color?
        </InputLabel>
        <NativeSelect
          data-qa="material-select-native"
          value={color}
          onChange={e => setColor(e.target.value)}
          inputProps={{
            id: "material-select-native"
          }}
        >
          <option disabled value="" />
          <option value="blue">Blue</option>
          <option value="red">Red</option>
          <option value="green">Green</option>
        </NativeSelect>
      </FormControl>
      <br />
      <br />
      <FormControl style={{ minWidth: "140px" }}>
        <InputLabel id="label-multiple">Friends?</InputLabel>
        <Select
          data-qa="material-select-multiple"
          id="material-select-multiple"
          input={<Input />}
          labelId="label-multiple"
          onChange={handleChange}
          multiple
          value={personName}
        >
          {names.map(name => (
            <MenuItem key={name} value={name}>
              {name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}

export default MaterialUiSelects;
