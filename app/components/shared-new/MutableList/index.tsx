import { Box, BoxProps } from "grommet";
import { useState } from "react";
import {
  MutableListFunction,
  MutableListFields,
  MutableListType,
} from "../../../lib/types";
import ListItem from "./ListItem";
import NameInput from "./NameInput";
import CreateButton from "./CreateButton";

type Props = {
  fieldsList?: MutableListFields[] | null;
  onClick: (id: string) => void;
  onCreate: MutableListFunction;
  onDelete: (fields: MutableListFields) => void;
  onUpdate: MutableListFunction;
  overflow?: BoxProps["overflow"];
  pad?: BoxProps["pad"];
  selectedId: string;
  type: MutableListType;
};

export default function MutableList({
  fieldsList,
  overflow,
  pad,
  onClick,
  onCreate,
  onDelete,
  onUpdate,
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
        onCreate={onCreate}
        onDelete={() => onDelete(f)}
        onEdit={() => handleEdit(f.id)}
        onUpdate={onUpdate}
        type={type}
      />
    );
  });

  return (
    <Box height="full" overflow={overflow} pad={pad}>
      {listItemsHtml}
      {isCreate && (
        <NameInput
          onCloseForm={handleCloseForm}
          onCreate={onCreate}
          onUpdate={onUpdate}
          type={type}
        />
      )}
      <CreateButton onClick={handleCreate} type={type} />
    </Box>
  );
}
