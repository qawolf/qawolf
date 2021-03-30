import { Box } from "grommet";

import { borderSize, colors, textDesktop } from "../../theme/theme";

type Props = { children: string };

export default function CodeBlock({ children }: Props): JSX.Element {
  return (
    <Box background="gray2" pad="small" round={borderSize.small}>
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
