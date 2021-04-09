import { Box, BoxProps } from "grommet";

import { borderSize, colors, textDesktop } from "../../theme/theme";

type Props = {
  children: string;
  margin?: BoxProps["margin"];
};

export default function CodeBlock({ children, margin }: Props): JSX.Element {
  return (
    <Box
      background="gray2"
      margin={margin}
      pad="small"
      round={borderSize.small}
    >
      <code
        style={{
          color: colors.gray9,
          fontSize: textDesktop.componentParagraph.size,
          lineHeight: textDesktop.componentParagraph.height,
        }}
      >
        {children}
      </code>
    </Box>
  );
}
