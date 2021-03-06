import { TextInput as GrommetTextInput } from "grommet";
import { ChangeEvent, KeyboardEvent } from "react";
import styled from "styled-components";

import { copy } from "../../../../theme/copy";
import {
  borderSize,
  colors,
  edgeSize,
  fontFamily,
  fontWeight,
  textDesktop,
} from "../../../../theme/theme-new";

type Props = {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  value: string;
};

const StyledGrommetTextInput = styled(GrommetTextInput)`
  border-radius: ${borderSize.small};
  height: ${edgeSize.large};
  font-family: ${fontFamily.component};
  font-size: ${textDesktop.component.size};
  font-weight: ${fontWeight.normal};
  line-height: ${edgeSize.large};
  padding: 0;

  &::placeholder {
    color: ${colors.gray5};
  }
`;

export default function TextInput({
  onChange,
  onKeyDown,
  value,
}: Props): JSX.Element {
  return (
    <StyledGrommetTextInput
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={copy.invitePlacholder}
      plain
      value={value}
    />
  );
}
