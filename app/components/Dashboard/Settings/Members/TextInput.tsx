import { TextInput as GrommetTextInput } from "grommet";
import { ChangeEvent, KeyboardEvent } from "react";

import { copy } from "../../../../theme/copy";
import {
  borderSize,
  edgeSize,
  fontFamily,
  fontWeight,
  textDesktop,
} from "../../../../theme/theme";

type Props = {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  value: string;
};

export default function TextInput({
  onChange,
  onKeyDown,
  value,
}: Props): JSX.Element {
  const style = {
    borderRadius: borderSize.small,
    fontFamily: fontFamily.component,
    fontSize: textDesktop.component.size,
    fontWeight: fontWeight.normal,
    height: `calc(${edgeSize.large} - 2 * ${borderSize.xsmall})`,
    lineHeight: edgeSize.large,
    padding: 0,
  };

  return (
    <GrommetTextInput
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={copy.invitePlacholder}
      plain
      style={style}
      value={value}
    />
  );
}
