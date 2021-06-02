import { Box } from "grommet";
import { useContext, useEffect, useRef } from "react";

import { getCanvasSize } from "../../lib/size";
import { Rect } from "../../lib/types";
import Canvas from "./Canvas";
import Header from "./Canvas/Header";
import { EditorContext } from "./contexts/EditorContext";

type Props = {
  canvasRect: Rect;
  setCanvasRect: (rect: Rect) => void;
};

export default function Application({
  canvasRect,
  setCanvasRect,
}: Props): JSX.Element {
  const { run } = useContext(EditorContext);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !setCanvasRect) return;

    const rect = el.getBoundingClientRect();

    setCanvasRect({
      ...getCanvasSize({ height: rect.height, width: rect.width }),
      x: rect.x,
      y: rect.y,
    });

    const observer = new ResizeObserver((entries) => {
      const contentRect = entries[0]?.contentRect;
      if (!contentRect) return;

      const boundingRect = el.getBoundingClientRect();

      setCanvasRect({
        ...getCanvasSize({
          height: contentRect.height,
          width: contentRect.width,
        }),
        x: boundingRect.x,
        y: boundingRect.y,
      });

      window.requestAnimationFrame(() =>
        window.dispatchEvent(new UIEvent("resize"))
      );
    });

    observer.observe(el);

    return () => observer.unobserve(el);
  }, [ref, setCanvasRect]);

  const canvasHeight = canvasRect.height || null;
  const canvasWidth = canvasRect.width || null;

  return (
    <Box fill>
      {!run?.video_url && <Header />}
      <Box fill ref={ref}>
        <Canvas
          height={canvasHeight}
          videoUrl={run?.video_url}
          width={canvasWidth}
        />
      </Box>
    </Box>
  );
}
