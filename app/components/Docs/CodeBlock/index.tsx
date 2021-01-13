import { Box } from "grommet";
import Highlight, { defaultProps, Language } from "prism-react-renderer";
import styled from "styled-components";

import { edgeSize, text, width } from "../../../theme/theme-new";
import { theme } from "./theme";

type PropsTypes = {
  children: string;
  className: string;
};

const StyledPre = styled.pre`
  border-radius: ${edgeSize.xxsmall};
  font-size: ${text.xxsmall.size};
  line-height: ${text.xxsmall.height};
  margin-top: 6px; // outer pre already includes 18px of margin
  overflow-x: auto;
  padding: ${edgeSize.xsmall} ${edgeSize.small};
  // padding not included in width so need to subtract it
  width: calc(100vw - 2 * ${edgeSize.medium} - 2 * ${edgeSize.small});

  @media screen and (min-width: ${width.content}) {
    border-radius: ${edgeSize.xsmall};
    margin-top: 14px; // outer pre already includes 18px of margin
    // padding not included in width so need to subtract it
    width: calc(
      ${width.content} - ${width.docsSidebar} - ${edgeSize.xlarge} - 2 *
        ${edgeSize.small}
    );
  }
`;

export default function CodeBlock({
  children,
  className,
}: PropsTypes): JSX.Element {
  const language = className.replace(/language-/, "") as Language;

  return (
    <Box>
      <Highlight
        {...defaultProps}
        code={children.trim()}
        language={language}
        theme={theme}
      >
        {({ className, getLineProps, getTokenProps, style, tokens }) => (
          <StyledPre className={className} style={style}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line, key: i })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token, key })} />
                ))}
              </div>
            ))}
          </StyledPre>
        )}
      </Highlight>
    </Box>
  );
}
