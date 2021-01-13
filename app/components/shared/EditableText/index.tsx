import classNames from "classnames";
import debounce from "debounce";
import { Box, Button } from "grommet";
import { Edit } from "grommet-icons";
import { useEffect, useRef, useState } from "react";
import ContentEditable, { ContentEditableEvent } from "react-contenteditable";

import {
  colors,
  edgeSize,
  fontFamily,
  fontSize,
  hoverTransition,
  iconSize,
  lineHeight,
} from "../../../theme/theme";
import styles from "./EditableText.module.css";

type Props = {
  bold?: boolean;
  disabled?: boolean;
  name?: string;
  maxWidth?: string;
  onChange: (value: string) => void;
  value: string;
};

const DEBOUNCE_MS = 250;
const iconMargin = edgeSize.small;

export default function EditableText({
  bold,
  disabled,
  maxWidth,
  name,
  onChange,
  value,
}: Props): JSX.Element {
  const ref = useRef(null);
  const textValue = useRef(value);
  const [isFocus, setIsFocus] = useState(false);
  const debouncedOnChange = debounce(onChange, DEBOUNCE_MS);

  // update the value when it changes (except in edit mode)
  useEffect(() => {
    if (isFocus) return;
    textValue.current = value;
  }, [isFocus, value]);

  const handleBlur = () => {
    if (!document.activeElement) return;
    (document.activeElement as HTMLInputElement).blur();

    setIsFocus(false);
  };

  const handleChange = (e: ContentEditableEvent) => {
    const newValue = e.target.value;
    textValue.current = newValue;
    debouncedOnChange(newValue);
  };

  const handleClick = () => {
    if (disabled) return;
    setIsFocus(true);
  };

  const handleEnter = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Enter") return;
    // do not add line break
    e.preventDefault();
    handleBlur();
  };

  const handleFocus = () => {
    if (!ref.current || disabled) return;
    setIsFocus(true);
    (ref.current as HTMLInputElement).focus();
  };

  const family = bold ? fontFamily.bold : fontFamily.normal;

  return (
    <Box
      align="center"
      className={classNames(styles.rename, { [styles.disabled]: !!disabled })}
      data-test={`editable-text-${name || ""}`}
      direction="row"
      margin={{ left: `calc(-${iconSize} - ${iconMargin})` }}
      style={{ maxWidth }}
    >
      <Button
        disabled={disabled}
        margin={{ right: iconMargin }}
        onClick={handleFocus}
        plain
        style={{
          opacity: isFocus ? 1 : undefined,
          transition: hoverTransition,
        }}
      >
        <Edit color="black" size={iconSize} />
      </Button>
      <ContentEditable
        className={styles.contentEditable}
        disabled={disabled}
        html={textValue.current}
        innerRef={ref}
        onBlur={handleBlur}
        onChange={handleChange}
        onClick={handleClick}
        onKeyPress={handleEnter}
        spellCheck={false}
        style={{
          color: colors.black,
          fontFamily: family,
          fontSize: fontSize.large,
          lineHeight: lineHeight.large,
          minWidth: edgeSize.small,
          textOverflow: isFocus ? undefined : "ellipsis",
        }}
      />
    </Box>
  );
}
