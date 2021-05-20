import { Box } from "grommet";
import { ChangeEvent, useState } from "react";

import Button from "../../components/shared/AppButton";
import TextInput from "../../components/shared/AppTextInput";
import Add from "../../components/shared/icons/Add";
import Edit from "../../components/shared/icons/Edit";
import Trash from "../../components/shared/icons/Trash";
import Header from "../../components/shared/playground/Header";
import Text from "../../components/shared/Text";
import { copy } from "../../theme/copy";
import { overflowStyle } from "../../theme/theme";

const width = "480px";

export default function EditableList(): JSX.Element {
  const [editI, setEditI] = useState<number | null>(null);
  const [editItem, setEditItem] = useState("");

  const [groceries, setGroceries] = useState([
    "Marshmallows",
    "Graham crackers",
    "Chocolate",
  ]);
  const [newItem, setNewItem] = useState("");

  const handleAddChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setNewItem(e.target.value);
  };

  const handleEditChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setEditItem(e.target.value);
  };

  const handleCreate = (): void => {
    setGroceries((prev) => {
      return [...prev, newItem];
    });
    setNewItem("");
  };

  const handleDeleteClick = (i: number): void => {
    setGroceries((prev) => {
      const updated = [...prev];
      updated.splice(i, 1);

      return updated;
    });
  };

  const handleEditClick = (i: number): void => {
    setEditItem(groceries[i]);
    setEditI(i);
  };

  const handleSave = (): void => {
    setGroceries((prev) => {
      const updated = [...prev];
      updated[editI] = editItem;

      return updated;
    });

    setEditI(null);
  };

  const listHtml = groceries.map((item, i) => {
    return (
      <Box
        a11yTitle={`grocery-${i}`}
        align="center"
        direction="row"
        justify="between"
        margin={{ bottom: "xxsmall" }}
        width="full"
      >
        <Text color="gray9" size="component" style={overflowStyle}>
          {item}
        </Text>
        <Box align="center" direction="row">
          <Button
            IconComponent={Edit}
            a11yTitle={`edit item ${i}`}
            label={copy.edit}
            margin={{ right: "xxsmall" }}
            onClick={() => handleEditClick(i)}
            type="secondary"
          />
          <Button
            IconComponent={Trash}
            a11yTitle={`delete item ${i}`}
            hoverType="danger"
            label={copy.delete}
            onClick={() => handleDeleteClick(i)}
            type="secondary"
          />
        </Box>
      </Box>
    );
  });

  if (editI !== null) {
    return (
      <Box align="center">
        <Header label="Edit item" />
        <Box align="center" direction="row" width={width}>
          <TextInput
            onChange={handleEditChange}
            placeholder="Edited item"
            value={editItem}
            width="full"
          />
          <Button
            label={copy.cancel}
            margin={{ left: "xxsmall" }}
            onClick={() => setEditI(null)}
            type="secondary"
          />
          <Button
            isDisabled={!editItem}
            label={copy.save}
            margin={{ left: "xxsmall" }}
            onClick={handleSave}
            type="primary"
          />
        </Box>
      </Box>
    );
  }

  return (
    <Box align="center">
      <Header label="Grocery list" />
      <Box align="start" width={width}>
        {listHtml}
        <Box align="center" direction="row" justify="between" width="full">
          <TextInput
            onChange={handleAddChange}
            placeholder="New item"
            value={newItem}
            width="full"
          />
          <Button
            IconComponent={Add}
            isDisabled={!newItem}
            label={copy.add}
            margin={{ left: "xxsmall" }}
            onClick={handleCreate}
            type="primary"
          />
        </Box>
      </Box>
    </Box>
  );
}
