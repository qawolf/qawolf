import { Frame } from 'playwright'

export async function buildFrameSelector(frame: Frame): Promise<string | null> {
  // only build the frame selector if it is one frame down from the parent
  // skip building the frame for the main frame and nested frames
  const parentFrame = frame.parentFrame();
  if (!parentFrame || parentFrame.parentFrame()) return null;

  const name = frame.name();

  const fallbackSelector = name
    ? `[name="${name}"]`
    : `[url="${frame.url()}"`;

  try {
    const frameElement = await frame.frameElement();
    const selector = await parentFrame.evaluate(
      ({ frameElement }) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const qawolf: any = (window as any).qawolf;
        return qawolf.getSelector(frameElement);
      },
      { frameElement }
    );
    return selector || fallbackSelector;
  } catch (error) {
    // Due to timing, there's a possibility that `frameElement()`
    // throws due to the frame's parent having been closed/disposed.
  }

  return fallbackSelector;
}
