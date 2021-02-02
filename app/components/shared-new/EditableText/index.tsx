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

type Props = {
  disabled?: boolean;
  isEdit: boolean;
  onSave: (value: string) => void;
  setIsEdit: (isEdit: boolean) => void;
  value: string;
};

const StyledBox = styled(Box)`
  border: ${borderSize.xsmall} solid transparent;
  height: ${edgeSize.large};
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
  const [hasError, setHasError] = useState(false);

  const textHtml = (
    <StyledBox
      justify="center"
      pad={{ horizontal: "xxsmall" }}
      round={borderSize.small}
    >
      <Text color="gray9" size="componentHeader">
        {editedValue}
      </Text>
    </StyledBox>
  );

  if (disabled) return textHtml;

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setEditedValue(e.target.value);
  };

  const handleSave = (): void => {
    if (!editedValue) {
      setHasError(true);
      return;
    }

    setHasError(false);
    onSave(editedValue);
    setIsEdit(false);
  };

  if (isEdit) {
    return (
      <TextInput
        hasError={hasError}
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
