import { Box, ThemeContext } from "grommet";
import React, { FC } from "react";

import { theme } from "../../theme/theme-new";
import Application from "./Application";
import { RunnerProvider } from "./contexts/RunnerContext";
import { TestProvider } from "./contexts/TestContext";
import Header from "./Header";
import { useMode } from "./hooks/mode";
import Mobile from "./Mobile";
import Modals from "./Modals";
import Sidebar from "./Sidebar";

const WithProviders: FC = ({ children }): JSX.Element => {
  return (
    <TestProvider>
      <RunnerProvider>{children}</RunnerProvider>
    </TestProvider>
  );
};

// TODO: mobile view
export default function Editor(): JSX.Element {
  const mode = useMode();

  return (
    <ThemeContext.Extend value={theme}>
      <WithProviders>
        <Box background="gray0" height="100vh">
          <Header />
          <Box direction="row" fill justify="between">
            <Sidebar />
            <Box fill>
              <Application mode={mode} />
            </Box>
          </Box>
          <Modals mode={mode} />
        </Box>
      </WithProviders>
    </ThemeContext.Extend>
  );
}
