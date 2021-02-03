import { Box, Keyboard } from "grommet";
import { ChangeEvent, useEffect, useRef } from "react";

import { useOnClickOutside } from "../../../hooks/onClickOutside";
import { edgeSize } from "../../../theme/theme-new";
import AppTextInput from "../AppTextInput";

type Props = {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
  value: string;
};

const width = "480px";

export default function TextInput({
  onChange,
  onSave,
  value,
}: Props): JSX.Element {
  const ref = useRef<HTMLInputElement>(null);

  // focus text input
  useEffect(() => {
    if (ref.current) ref.current.focus();
  }, []);

  const handleBlur = (): void => {
    onSave();
    if (ref.current) ref.current.blur();
  };

  useOnClickOutside({ onClickOutside: handleBlur, ref });

  return (
    <Keyboard onEnter={onSave} onEsc={handleBlur}>
      <Box>
        <AppTextInput
          onChange={onChange}
          pad={edgeSize.xxsmall}
          ref={ref}
          size="componentHeader"
          value={value}
          width={width}
        />
      </Box>
    </Keyboard>
  );
}
