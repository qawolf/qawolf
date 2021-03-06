import { TextInput as GrommetTextInput } from "grommet";
import { ChangeEvent } from "react";
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
  value: string;
};

const StyledGrommetTextInput = styled(GrommetTextInput)`
  border-radius: ${borderSize.small};
  height: ${edgeSize.large};
  font-family: ${fontFamily.component};
  font-size: ${textDesktop.component.size};
  font-weight: ${fontWeight.normal};
  line-height: ${edgeSize.large};
  padding: 0 ${edgeSize.xsmall};

  &::placeholder {
    color: ${colors.gray5};
  }
`;

export default function TextInput({ onChange, value }: Props): JSX.Element {
  return (
    <StyledGrommetTextInput
      onChange={onChange}
      placeholder={copy.invitePlacholder}
      plain
      value={value}
    />
  );
}
