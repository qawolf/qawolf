import { Box } from "grommet";
import { ChangeEvent, KeyboardEvent, useRef, useState } from "react";

import { useOnClickOutside } from "../../../hooks/onClickOutside";
import {
  MutableListFields,
  MutableListFunction,
  MutableListType,
} from "../../../lib/types";
import { copy } from "../../../theme/copy";
import { borderSize, edgeSize } from "../../../theme/theme-new";
import TextInput from "../AppTextInput";

type Props = {
  fields?: MutableListFields;
  onCloseForm: () => void;
  onSave: MutableListFunction;
  type: MutableListType;
};

const pad = `calc(${edgeSize.xxsmall} - ${borderSize.xsmall})`;

export default function NameInput({
  fields,
  onCloseForm,
  onSave,
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

    onSave({ callback: onCloseForm, fields, name });
  };

  useOnClickOutside({ onClickOutside: handleSave, ref });

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (["Enter", "Escape"].includes(e.key)) {
      e.stopPropagation();
      handleSave();
    }
  };

  return (
    <Box margin={{ bottom: borderSize.small }}>
      <TextInput
        autoFocus
        id={type}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        pad={type === "group" ? { left: pad, right: pad } : undefined}
        placeholder={copy[type]}
        ref={ref}
        value={name}
      />
    </Box>
  );
}
