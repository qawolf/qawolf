import { Box } from "grommet";
import { useContext, useEffect, useRef, useState } from "react";

import { getCanvasSize } from "../../lib/size";
import Canvas from "./Canvas";
import Header from "./Canvas/Header";
import { TestContext } from "./contexts/TestContext";
import { Mode } from "./hooks/mode";

type Props = { mode: Mode };

type State = {
  height: number | null;
  width: number | null;
};

export default function Application({ mode }: Props): JSX.Element {
  const { run } = useContext(TestContext);

  const ref = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState<State>({
    height: null,
    width: null,
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    setCanvasSize(
      getCanvasSize({ height: el.clientHeight, width: el.clientWidth })
    );

    const observer = new ResizeObserver((entries) => {
      const newSize = entries[0]?.contentRect;
      if (!newSize) return;

      setCanvasSize(
        getCanvasSize({ height: newSize.height, width: newSize.width })
      );

      window.requestAnimationFrame(() =>
        window.dispatchEvent(new UIEvent("resize"))
      );
    });

    observer.observe(el);

    return () => observer.unobserve(el);
  }, [ref]);

  const canvasHeight = canvasSize.height || null;
  const canvasWidth = canvasSize.width || null;

  return (
    <Box fill>
      <Header hasVideo={!!run?.video_url} />
      <Box fill ref={ref}>
        <Canvas
          height={canvasHeight}
          mode={mode}
          videoUrl={run?.video_url}
          width={canvasWidth}
        />
      </Box>
    </Box>
  );
}
