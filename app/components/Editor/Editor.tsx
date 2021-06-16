import { Box } from "grommet";
import React, { FC, useState } from "react";

import { useWindowSize } from "../../hooks/windowSize";
import { Rect } from "../../lib/types";
import { breakpoints } from "../../theme/theme";
import Application from "./Application";
import Container from "./Container";
import { EditorProvider } from "./contexts/EditorContext";
import { RunnerProvider } from "./contexts/RunnerContext";
import Cursors from "./Cursors";
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
  const [canvasRect, setCanvasRect] = useState<Rect>({
    height: null,
    width: null,
    x: null,
    y: null,
  });
  const windowSize = useWindowSize();

  return (
    <WithProviders>
      {windowSize.width && windowSize.width < breakpoints.small.value ? (
        <EditorMobile />
      ) : (
        <Container>
          <Cursors canvasRect={canvasRect} windowSize={windowSize} />
          <Header />
          <Box direction="row" fill justify="between">
            <Sidebar />
            <Application
              canvasRect={canvasRect}
              setCanvasRect={setCanvasRect}
            />
          </Box>
        </Container>
      )}
    </WithProviders>
  );
}
