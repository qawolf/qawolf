import { Box, BoxProps } from "grommet";
import { useState } from "react";

import {
  MutableListFields,
  MutableListFunction,
  MutableListType,
} from "../../../lib/types";
import CreateButton from "./CreateButton";
import ListItem from "./ListItem";
import NameInput from "./NameInput";

type Props = {
  fieldsList?: MutableListFields[] | null;
  onClick: (id: string) => void;
  onDelete: (fields: MutableListFields) => void;
  onSave: MutableListFunction;
  overflow?: BoxProps["overflow"];
  pad?: BoxProps["pad"];
  selectedId: string | null;
  type: MutableListType;
};

export default function MutableList({
  fieldsList,
  overflow,
  pad,
  onClick,
  onDelete,
  onSave,
  selectedId,
  type,
}: Props): JSX.Element {
  const [editId, setEditId] = useState<string | null>(null);
  const [isCreate, setIsCreate] = useState(false);

  const handleCloseForm = (): void => {
    setEditId(null);
    setIsCreate(false);
  };

  const handleCreate = (): void => {
    setEditId(null); // clear existing forms
    setIsCreate(true);

    // focus form if it already exists
    document.getElementById(type)?.focus();
  };

  const handleEdit = (editId: string): void => {
    setIsCreate(false);
    setEditId(editId);
  };

  const listItemsHtml = (fieldsList || []).map((f) => {
    return (
      <ListItem
        editId={editId}
        fields={f}
        isSelected={f.id === selectedId}
        key={f.id}
        onClick={() => onClick(f.id)}
        onCloseForm={handleCloseForm}
        onDelete={() => onDelete(f)}
        onEdit={() => handleEdit(f.id)}
        onSave={onSave}
        type={type}
      />
    );
  });

  return (
    <Box height="full" overflow={overflow} pad={pad}>
      {listItemsHtml}
      {isCreate && (
        <NameInput onCloseForm={handleCloseForm} onSave={onSave} type={type} />
      )}
      <CreateButton onClick={handleCreate} type={type} />
    </Box>
  );
}
