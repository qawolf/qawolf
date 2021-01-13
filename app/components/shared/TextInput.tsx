import { Box, TextInput as GrommetTextInput } from "grommet";

import { edgeSize, fontSize } from "../../theme/theme";

type Props = {
  hasError?: boolean;
  name?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  value: string;
};

export default function TextInput({
  hasError,
  name,
  onChange,
  placeholder,
  value,
}: Props): JSX.Element {
  return (
    <Box
      border={{ color: hasError ? "pink" : "borderGray" }}
      fill="horizontal"
      margin={{ right: "small" }}
      round="small"
    >
      <GrommetTextInput
        name={name}
        onChange={onChange}
        placeholder={placeholder}
        plain
        style={{
          fontSize: fontSize.medium,
          fontWeight: "normal",
          padding: `${edgeSize.small} ${edgeSize.medium}`,
        }}
        value={value}
      />
    </Box>
  );
}
