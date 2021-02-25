import { Box } from "grommet";
import { ChangeEvent, KeyboardEvent, useRef, useState } from "react";
import { useOnClickOutside } from "../../../hooks/onClickOutside";
import {
  MutableListFunction,
  MutableListFields,
  MutableListType,
} from "../../../lib/types";
import { copy } from "../../../theme/copy";
import { borderSize } from "../../../theme/theme-new";
import TextInput from "../AppTextInput";

type Props = {
  fields?: MutableListFields;
  onCreate: MutableListFunction;
  onCloseForm: () => void;
  onUpdate: MutableListFunction;
  type: MutableListType;
};

export default function NameInput({
  fields,
  onCreate,
  onCloseForm,
  onUpdate,
  type,
}: Props): JSX.Element {
  const ref = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(fields?.name || "");

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setName(e.target.value);
  };

  const handleSave = (): void => {
    if (!name) {
      onCloseForm();
      return;
    }

    if (fields) {
      onUpdate(fields, onCloseForm);
    } else {
      onCreate(fields, onCloseForm);
    }
  };

  const handleBlur = (): void => {
    handleSave();
    ref.current?.blur();
  };

  const handleClickOutside = (): void => {
    if (fields) handleBlur();
  };

  useOnClickOutside({ onClickOutside: handleClickOutside, ref });

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") handleBlur();
  };

  return (
    <Box margin={{ bottom: borderSize.small }}>
      <TextInput
        autoFocus
        id={type}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={copy[type]}
        ref={ref}
        value={name}
      />
    </Box>
  );
}
