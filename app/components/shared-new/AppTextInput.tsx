import { TextInput as GrommetTextInput } from "grommet";
import { forwardRef, Ref } from "react";
import styled from "styled-components";

import {
  borderSize,
  colors,
  edgeSize,
  fontFamily,
  fontWeight,
  text,
  transition,
} from "../../theme/theme-new";

type Props = {
  hasError?: boolean;
  id?: string;
  name?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  value: string;
};

const StyledGrommetTextInput = styled(GrommetTextInput)`
  border-color: ${colors.fill20};
  border-radius: ${borderSize.small};
  border-width: ${borderSize.xsmall};
  color: ${colors.textDark};
  font-family: ${fontFamily.component};
  font-size: ${text.component.size};
  font-weight: ${fontWeight.normal};
  height: ${edgeSize.large};
  line-height: ${edgeSize.large};
  padding: 0 ${edgeSize.xsmall};
  transition: ${transition};

  &:focus {
    border-color: ${colors.primary5};
  }

  &::placeholder {
    color: ${colors.gray5};
  }
`;

function TextInput(
  { hasError, id, name, onChange, placeholder, value }: Props,
  ref?: Ref<HTMLInputElement>
): JSX.Element {
  return (
    <StyledGrommetTextInput
      id={id}
      name={name}
      onChange={onChange}
      placeholder={placeholder}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      style={hasError ? { borderColor: colors.danger } : undefined}
      value={value}
    />
  );
}

export default forwardRef(TextInput);
