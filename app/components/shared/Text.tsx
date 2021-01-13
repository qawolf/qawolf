import { Text as GrommetText, TextProps } from "grommet";
import { CSSProperties, ReactNode } from "react";

import { codeFontFamily, fontFamily } from "../../theme/theme";

type Props = TextProps & {
  children: ReactNode;
  className?: string;
  isCode?: boolean;
  style?: CSSProperties;
};

export default function Text(props: Props): JSX.Element {
  const { children, className, style, ...textProps } = props;
  const finalStyle = style || {};

  if (props.weight === "bold") {
    return (
      <GrommetText
        className={className}
        style={{
          fontFamily: props.isCode ? codeFontFamily : fontFamily.bold,
          fontWeight: props.isCode ? "bold" : undefined,
          ...finalStyle,
        }}
        {...textProps}
      >
        {children}
      </GrommetText>
    );
  }

  return (
    <GrommetText
      style={{
        fontFamily: props.isCode ? codeFontFamily : undefined,
        ...(style || {}),
      }}
      {...textProps}
    >
      {children}
    </GrommetText>
  );
}
