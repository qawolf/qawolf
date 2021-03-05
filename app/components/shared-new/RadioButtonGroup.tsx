import { Box, BoxProps } from "grommet";
import { ChangeEvent } from "react";

import RadioButton from "./RadioButton";

type Option = {
  label: string;
  value: number | string;
};

type Props = {
  direction?: BoxProps["direction"];
  gap?: BoxProps["gap"];
  name: string;
  onChange: (e?: ChangeEvent<HTMLInputElement>) => void;
  options: Option[];
  value: number | string;
  wrap?: BoxProps["wrap"];
};

export default function RadioButtonGroup({
  direction,
  gap,
  name,
  onChange,
  options,
  value,
  wrap,
}: Props): JSX.Element {
  const radioButtonsHtml = options.map((option) => {
    return (
      <RadioButton
        a11yTitle={`select ${option.label}`}
        checked={value === option.value}
        key={option.value}
        label={option.label}
        name={name}
        onChange={onChange}
        value={option.value}
      />
    );
  });

  return (
    <Box direction={direction} gap={gap} wrap={wrap}>
      {radioButtonsHtml}
    </Box>
  );
}
