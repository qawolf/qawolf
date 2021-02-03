import { Box, ThemeContext } from "grommet";
import React, { FC } from "react";
import { useWindowSize } from "../../hooks/windowSize";

import { breakpoints, theme } from "../../theme/theme-new";
import Application from "./Application";
import { RunnerProvider } from "./contexts/RunnerContext";
import { TestProvider } from "./contexts/TestContext";
import EditorMobile from "./EditorMobile";
import Header from "./Header";
import { useMode } from "./hooks/mode";
import Modals from "./Modals";
import Sidebar from "./Sidebar";

const WithProviders: FC = ({ children }): JSX.Element => {
  return (
    <TestProvider>
      <RunnerProvider>{children}</RunnerProvider>
    </TestProvider>
  );
};

export default function Editor(): JSX.Element {
  const mode = useMode();
  const { width } = useWindowSize();

  if (width && width < breakpoints.medium.value)
    return <EditorMobile mode={mode} />;

  return (
    <ThemeContext.Extend value={theme}>
      <WithProviders>
        <Box background="gray0" height="100vh" overflow="hidden">
          <Header mode={mode} />
          <Box direction="row" fill justify="between">
            <Sidebar mode={mode} />
            <Application mode={mode} />
          </Box>
          <Modals mode={mode} />
        </Box>
      </WithProviders>
    </ThemeContext.Extend>
  );
}
