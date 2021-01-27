import { TextInput as GrommetTextInput } from "grommet";
import styled from "styled-components";

import {
  borderSize,
  breakpoints,
  colors,
  edgeSize,
  fontFamily,
  fontWeight,
  text,
  textDesktop,
  transition,
} from "../../theme/theme-new";

type Props = {
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
  line-height: ${text.component.height};
  padding: 0 ${edgeSize.xsmall};
  transition: ${transition};

  &:focus {
    border-color: ${colors.primary5};
  }

  &::placeholder {
    color: ${colors.gray5};
  }
`;

export default function TextInput({
  id,
  name,
  onChange,
  placeholder,
  value,
}: Props): JSX.Element {
  return (
    <StyledGrommetTextInput
      id={id}
      name={name}
      onChange={onChange}
      placeholder={placeholder}
      value={value}
    />
  );
}
