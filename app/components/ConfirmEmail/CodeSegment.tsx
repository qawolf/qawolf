import { Box, TextInput } from "grommet";
import { ReactNode } from "react";

import { colors, fontFamily, fontSize } from "../../theme/theme";
import styles from "./ConfirmEmail.module.css";

type Props = {
  code: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  startIndex: number;
};

const inputProps = {
  className: styles.codeInput,
  maxLength: 1,
  plain: true,
};

const inputStyle = {
  borderRadius: 0,
  fontFamily: fontFamily.bold,
  fontSize: fontSize.xxlarge,
  maxWidth: "80px",
  textAlign: "center" as const,
};

export default function CodeSegment({
  code,
  onChange,
  onPaste,
  startIndex,
}: Props): JSX.Element {
  const children: ReactNode[] = [];

  for (let i = 0; i < 3; i++) {
    const index = startIndex + i;
    // include right border if not the last box
    const style =
      i < 2
        ? { ...inputStyle, borderRight: `1px solid ${colors.darkGray}` }
        : inputStyle;

    children.push(
      <TextInput
        {...inputProps}
        id={`${index}-code`}
        key={index}
        onChange={onChange}
        onPaste={onPaste}
        style={style}
        value={code[index] || ""}
      />
    );
  }

  return (
    <Box
      border={{ color: "darkGray" }}
      direction="row"
      round="small"
      overflow="hidden"
    >
      {children}
    </Box>
  );
}
