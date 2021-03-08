import { TextInput as GrommetTextInput } from "grommet";
import { forwardRef, Ref } from "react";
import styled from "styled-components";

import {
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
  name?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  value: string;
};

const StyledGrommetTextInput = styled(GrommetTextInput)`
  border-color: ${colors.fill20};
  border-radius: ${edgeSize.xxsmall};
  color: ${colors.textDark};
  font-family: ${fontFamily.medium};
  font-size: ${text.xsmall.size};
  font-weight: ${fontWeight.medium};
  height: 48px;
  line-height: ${text.xsmall.height};
  transition: ${transition};

  &:focus {
    border-color: ${colors.primaryFill};
  }

  &::placeholder {
    color: ${colors.gray5};
  }

  @media screen and (min-width: ${breakpoints.medium.value}px) {
    font-size: ${textDesktop.xsmall.size};
    height: 56px;
    line-height: ${textDesktop.xsmall.height};
  }
`;

function TextInput(
  { name, onChange, placeholder, value }: Props,
  ref?: Ref<HTMLInputElement>
): JSX.Element {
  return (
    <StyledGrommetTextInput
      name={name}
      onChange={onChange}
      placeholder={placeholder}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      value={value}
    />
  );
}

export default forwardRef(TextInput);
