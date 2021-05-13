import { Box } from "grommet";
import { MouseEvent, useState } from "react";
import styled from "styled-components";

import {
  MutableListFields,
  MutableListFunction,
  MutableListType,
} from "../../../lib/types";
import { copy } from "../../../theme/copy";
import {
  borderSize,
  colors,
  overflowStyle,
  transitionDuration,
} from "../../../theme/theme";
import Text from "../Text";
import NameInput from "./NameInput";
import Options, { id } from "./Options";

type Props = {
  editId: string;
  fields: MutableListFields;
  isSelected: boolean;
  onClick: () => void;
  onCloseForm: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onSave: MutableListFunction;
  type: MutableListType;
};

const StyledBox = styled(Box)`
  cursor: pointer;
  transition: background ${transitionDuration};

  #${id} {
    opacity: 0;
    transition: opacity ${transitionDuration};
  }

  &:hover {
    background: ${colors.gray2};

    #${id} {
      opacity: 1;
    }
  }
`;

export default function ListItem({
  editId,
  fields,
  isSelected,
  onClick,
  onCloseForm,
  onDelete,
  onEdit,
  onSave,
  type,
}: Props): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  if (fields.id === editId) {
    return (
      <NameInput
        fields={fields}
        onCloseForm={onCloseForm}
        onSave={onSave}
        type={type}
      />
    );
  }

  const handleClick = (): void => {
    if (!isOpen) onClick();
  };

  const handleOptionsClick = (e: MouseEvent): void => {
    e.stopPropagation(); // do not click on larger element
    setIsOpen((prev) => !prev);
  };

  const handleOptionsClose = (): void => setIsOpen(false);

  return (
    <StyledBox
      a11yTitle={`${copy[type]} ${fields.name}`}
      align="center"
      background={isSelected ? "gray2" : "transparent"}
      direction="row"
      flex={false}
      justify="between"
      margin={{ bottom: borderSize.small }}
      onClick={handleClick}
      pad={{
        left: "xsmall",
        right: "xxsmall",
        vertical: "xxsmall",
      }}
      round={borderSize.small}
    >
      <Text color="gray9" size="component" style={overflowStyle}>
        {fields.name}
      </Text>
      <Options
        isOpen={isOpen}
        onClick={handleOptionsClick}
        onClose={handleOptionsClose}
        onDelete={onDelete}
        onEdit={onEdit}
        type={type}
      />
    </StyledBox>
  );
}
