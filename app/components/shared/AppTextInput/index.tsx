import { Box, BoxProps, TextInput as GrommetTextInput } from "grommet";
import {
  ChangeEvent,
  forwardRef,
  KeyboardEvent,
  Ref,
  useEffect,
  useRef,
  useState,
} from "react";
import styled from "styled-components";

import {
  borderSize,
  colors,
  edgeSize,
  fontFamily,
  fontWeight,
  textDesktop,
  transition,
} from "../../../theme/theme";
import { Size } from "../Text/config";
import ErrorBadge from "./ErrorBadge";

type Props = {
  autoFocus?: boolean;
  error?: string;
  id?: string;
  isDisabled?: boolean;
  margin?: BoxProps["margin"];
  name?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  pad?: { left: string; right: string };
  placeholder?: string;
  size?: Size;
  value: string;
  width?: string;
};

const StyledGrommetTextInput = styled(GrommetTextInput)`
  border-color: ${colors.gray3};
  border-radius: ${borderSize.small};
  border-width: ${borderSize.xsmall};
  color: ${colors.textDark};
  font-weight: ${fontWeight.normal};
  height: ${edgeSize.large};
  line-height: ${edgeSize.large};
  transition: ${transition};

  &:hover {
    border-color: ${colors.gray5};
  }

  &:focus {
    border-color: ${colors.primary};
  }

  &::placeholder {
    color: ${colors.gray5};
  }
`;

function TextInput(
  {
    autoFocus,
    error,
    id,
    isDisabled,
    margin,
    name,
    onChange,
    onKeyDown,
    pad,
    placeholder,
    size,
    value,
    width,
  }: Props,
  ref?: Ref<HTMLInputElement>
): JSX.Element {
  const errorRef = useRef<HTMLDivElement>(null);
  const [errorWidth, setErrorWidth] = useState(0);

  useEffect(() => {
    setErrorWidth(errorRef.current?.clientWidth || 0);
  }, [error]);

  const finalSize = size || "component";

  const style = {
    borderColor: error ? colors.danger5 : undefined,
    fontFamily: fontFamily[finalSize],
    fontSize: textDesktop[finalSize].size,
    paddingBottom: 0,
    paddingLeft: pad?.left || `calc(${edgeSize.xsmall} - ${borderSize.xsmall})`,
    paddingRight:
      pad?.right ||
      `calc(${edgeSize.xsmall} - ${borderSize.xsmall} + ${errorWidth}px)`,
    paddingTop: 0,
  };

  return (
    <Box margin={margin} style={{ position: "relative" }} width={width}>
      <StyledGrommetTextInput
        autoFocus={autoFocus}
        disabled={isDisabled}
        id={id}
        name={name}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref={ref as any}
        style={style}
        value={value}
      />
      {!!error && <ErrorBadge error={error} ref={errorRef} />}
    </Box>
  );
}

export default forwardRef(TextInput);
