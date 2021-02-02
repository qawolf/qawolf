import { Box, Keyboard } from "grommet";
import { ChangeEvent, useEffect, useRef } from "react";
import { edgeSize } from "../../../theme/theme-new";
import AppTextInput from "../AppTextInput";

type Props = {
  hasError?: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
  value: string;
};

const width = "480px";

export default function TextInput({
  hasError,
  onChange,
  onSave,
  value,
}: Props): JSX.Element {
  const ref = useRef<HTMLInputElement>(null);

  // focus text input
  useEffect(() => {
    if (ref.current) ref.current.focus();
  }, [ref.current]);

  return (
    <Keyboard onEnter={onSave}>
      <Box>
        <AppTextInput
          hasError={hasError}
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
