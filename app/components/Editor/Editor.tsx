import { Box } from "grommet";
import React, { FC } from "react";

import { useWindowSize } from "../../hooks/windowSize";
import { breakpoints } from "../../theme/theme";
import Application from "./Application";
import { RunnerProvider } from "./contexts/RunnerContext";
import { TestProvider } from "./contexts/TestContext";
import EditorMobile from "./EditorMobile";
import Header from "./Header";
import { useMode } from "./hooks/mode";
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

  return (
    <WithProviders>
      {width && width < breakpoints.small.value ? (
        <EditorMobile mode={mode} />
      ) : (
        <Box
          background="gray0"
          data-hj-suppress
          height="100vh"
          overflow="hidden"
        >
          <Header mode={mode} />
          <Box direction="row" fill justify="between">
            <Sidebar />
            <Application mode={mode} />
          </Box>
        </Box>
      )}
    </WithProviders>
  );
}
