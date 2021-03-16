import { Box } from "grommet";
import Highlight, { defaultProps, Language } from "prism-react-renderer";
import styled from "styled-components";

import {
  border,
  borderSize,
  colors,
  textDesktop,
} from "../../../../theme/theme";

const StyledCode = styled.code`
  color: ${colors.codeCyan};
  font-family: Menlo, Monaco, "Courier New", monospace;
  font-size: ${textDesktop.xxsmall.size};
  line-height: ${textDesktop.xxsmall.height};
`;

export default function Code(): JSX.Element {
  // TODO
  const code = 'await assertText(page, "hello");';

  return (
    <Box
      background="gray10"
      border={{ ...border, color: "gray8" }}
      margin={{ vertical: "medium" }}
      pad="xsmall"
      round={borderSize.small}
    >
      <StyledCode>{code}</StyledCode>
    </Box>
  );
}
