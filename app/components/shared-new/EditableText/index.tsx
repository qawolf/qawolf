import { Box, Button, Keyboard } from "grommet";
import styled from "styled-components";
import {
  borderSize,
  colors,
  edgeSize,
  transitionDuration,
} from "../../../theme/theme-new";
import Text from "../Text";
import TextInput from "./TextInput";
import { ChangeEvent, useState } from "react";
import Edit from "../icons/Edit";

type Props = {
  disabled?: boolean;
  isEdit: boolean;
  onSave: (value: string) => void;
  setIsEdit: (isEdit: boolean) => void;
  value: string;
};

const StyledBox = styled(Box)`
  transition: background ${transitionDuration}, border-color: ${transitionDuration};

  &:hover {
    background: ${colors.gray2};
  }

  &:active {
    background: transparent;
    border-color: ${colors.primary};
  }
`;

export default function EditableText({
  disabled,
  isEdit,
  onSave,
  setIsEdit,
  value,
}: Props): JSX.Element {
  const [editedValue, setEditedValue] = useState(value);

  const BoxComponent = disabled ? Box : StyledBox;

  const textHtml = (
    <BoxComponent
      align="center"
      border={{ color: "transparent", size: "xsmall" }}
      direction="row"
      height={edgeSize.large}
      pad={{ horizontal: "xxsmall" }}
      round={borderSize.small}
    >
      <Text
        color="gray9"
        margin={disabled ? undefined : { right: "xxsmall" }}
        size="componentHeader"
      >
        {editedValue}
      </Text>
      {!disabled && <Edit color={colors.gray9} size={edgeSize.small} />}
    </BoxComponent>
  );

  if (disabled) return textHtml;

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setEditedValue(e.target.value);
  };

  const handleSave = (): void => {
    setIsEdit(false);

    if (!editedValue) {
      setEditedValue(value);
      return;
    }

    onSave(editedValue);
  };

  if (isEdit) {
    return (
      <TextInput
        onChange={handleChange}
        onSave={handleSave}
        value={editedValue}
      />
    );
  }

  return (
    <Button plain onClick={() => setIsEdit(true)}>
      {textHtml}
    </Button>
  );
}
