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
  &:hover {
    border-color: ${colors.gray5} !important;
  }

  &:focus {
    border-color: ${colors.primary} !important;
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
    borderColor: error ? colors.danger5 : colors.gray3,
    borderRadius: borderSize.small,
    borderWidth: borderSize.xsmall,
    color: colors.gray9,
    fontFamily: fontFamily[finalSize],
    fontWeight: fontWeight.normal,
    fontSize: textDesktop[finalSize].size,
    height: edgeSize.large,
    lineHeight: edgeSize.large,
    paddingBottom: 0,
    paddingLeft: pad?.left || `calc(${edgeSize.xsmall} - ${borderSize.xsmall})`,
    paddingRight:
      pad?.right ||
      `calc(${edgeSize.xsmall} - ${borderSize.xsmall} + ${errorWidth}px)`,
    paddingTop: 0,
    transition,
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
