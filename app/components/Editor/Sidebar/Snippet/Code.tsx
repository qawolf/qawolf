import { Box } from "grommet";
import Highlight, { defaultProps } from "prism-react-renderer";

import { theme } from "../../../../theme/prismCodeBlock";
import { border, borderSize } from "../../../../theme/theme";

export default function Code(): JSX.Element {
  // TODO
  const code = 'await assertText(page, "hello");';

  return (
    <Box
      background="gray10"
      border={{ ...border, color: "gray8" }}
      margin={{ vertical: "medium" }}
      overflow="auto"
      pad="xsmall"
      round={borderSize.small}
    >
      <Highlight
        {...defaultProps}
        code={code.trim()}
        language="javascript"
        theme={theme}
      >
        {({ className, getLineProps, getTokenProps, style, tokens }) => (
          <pre className={className} style={{ ...style, margin: 0 }}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line, key: i })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token, key })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </Box>
  );
}
