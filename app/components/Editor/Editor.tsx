import { Box } from "grommet";
import React, { FC } from "react";

import { useWindowSize } from "../../hooks/windowSize";
import { breakpoints } from "../../theme/theme";
import Application from "./Application";
import { EditorProvider } from "./contexts/EditorContext";
import { RunnerProvider } from "./contexts/RunnerContext";
import EditorMobile from "./EditorMobile";
import Header from "./Header";
import Sidebar from "./Sidebar";

const WithProviders: FC = ({ children }): JSX.Element => {
  return (
    <EditorProvider>
      <RunnerProvider>{children}</RunnerProvider>
    </EditorProvider>
  );
};

export default function Editor(): JSX.Element {
  const { width } = useWindowSize();

  return (
    <WithProviders>
      {width && width < breakpoints.small.value ? (
        <EditorMobile />
      ) : (
        <Box
          background="gray0"
          data-hj-suppress
          height="100vh"
          overflow="hidden"
        >
          <Header />
          <Box direction="row" fill justify="between">
            <Sidebar />
            <Application />
          </Box>
        </Box>
      )}
    </WithProviders>
  );
}
