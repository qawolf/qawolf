import { Box } from "grommet";
import { useContext, useEffect, useRef, useState } from "react";

import { getCanvasSize } from "../../lib/size";
import Action from "./Action";
import Canvas, { BORDER_SIZE } from "./Canvas";
import { ActionsContext } from "./contexts/ActionsContext";
import { Mode } from "./hooks/mode";

type Props = {
  mode: Mode;
};

type State = {
  height: number | null;
  width: number | null;
};

export default function Application({ mode }: Props): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState<State>({
    height: null,
    width: null,
  });

  const { actions, removeAction } = useContext(ActionsContext);

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

  const actionsHtml = actions.map(({ id, x, y }) => {
    return <Action id={id} key={id} removeAction={removeAction} x={x} y={y} />;
  });

  const canvasHeight = canvasSize.height
    ? canvasSize.height - 2 * BORDER_SIZE
    : null;
  const canvasWidth = canvasSize.width
    ? canvasSize.width - 2 * BORDER_SIZE
    : null;

  return (
    <>
      <Box fill ref={ref}>
        <Canvas height={canvasHeight} mode={mode} width={canvasWidth} />
      </Box>
      {actionsHtml}
    </>
  );
}
