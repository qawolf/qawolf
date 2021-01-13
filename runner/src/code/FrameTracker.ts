import Debug from "debug";
import { BrowserContext, ElementHandle, Frame, Page } from "playwright";

import { forEachFrame, forEachPage } from "../environment/forEach";

type BindingOptions = {
  frame: Frame;
  page: Page;
};

type FrameTrackerConstructorOptions = {
  attributes?: string[];
  context: BrowserContext;
};

type UpdateSelectorForFrameOptions = {
  frame?: Frame;
  frameId?: number;
};

const debug = Debug("qawolf:FrameTracker");

const getFrameElementForFrame = async (
  frame: Frame
): Promise<ElementHandle<Node> | null> => {
  let frameElement = null;
  try {
    frameElement = await frame.frameElement();
  } catch (error) {
    // Due to timing, there's always a possibility that `frameElement()`
    // throws due to the frame's parent having been closed/disposed.
  }
  return frameElement;
};

export const buildFrameSelector = async (
  frame: Frame,
  frameId: number,
  attributes: string[]
): Promise<{ selector: string | null; isHidden: boolean }> => {
  // build the frame selector if this is one frame down from the parent
  const parentFrame = frame.parentFrame();

  if (!parentFrame) {
    debug(`Frame with ID ${frameId} is the main frame. Not building selector.`);
    return { selector: null, isHidden: false };
  }

  if (parentFrame.parentFrame()) {
    debug(`Frame with ID ${frameId} is a nested frame. Not building selector.`);
    return { selector: null, isHidden: false };
  }

  const frameElement = await getFrameElementForFrame(frame);
  if (!frameElement) {
    debug(
      `Frame with ID ${frameId} is no longer available. Not building selector.`
    );
    return { selector: null, isHidden: false };
  }

  debug(`Building frame selector for frame with ID ${frameId}`);

  const selector: string | undefined = await parentFrame.evaluate(
    ({ attributes, frameElement, frameId }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const web: any = (window as any).qawolf;

      if (!web.isVisible(frameElement as HTMLElement)) {
        // Google and others use a bunch of invisible iframes to do things.
        // If an iframe isn't visible, we don't need to track its attributes
        // or generate a selector for it ahead of time.
        return "";
      }

      const selector = web.buildSelector({
        attributes,
        // It's important that we don't use the cached selector because
        // when this is called subsequent times, the purpose is to
        // build a new selector due to iframe attributes having changed.
        clearCache: true,
        isClick: false,
        target: frameElement as HTMLElement,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!(frameElement as any).qawAttributeObserver) {
        const observer = new MutationObserver((mutations) => {
          const change = mutations.find(
            (mutation) => mutation.type === "attributes"
          );
          if (change) {
            console.debug("iframe attribute changes", change);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).qawFrameSelectorChange(frameId);
          }
        });

        observer.observe(frameElement, {
          attributes: true, // configure it to listen to attribute changes
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (frameElement as any).qawAttributeObserver = observer;
      }

      return selector;
    },
    { attributes, frameElement, frameId }
  );

  if (!selector || selector.length === 0) {
    debug(`Frame with ID ${frameId} is hidden. Not building selector.`);
    return { selector: null, isHidden: true };
  }

  return { selector, isHidden: false };
};

/**
 * @summary The FrameTracker class keeps track of all frames created
 *   within a specific Playwright BrowserContext, generating and
 *   regenerating selectors for them as necessary so that we always
 *   have one available when any event comes through that took place
 *   in that frame.
 */
export class FrameTracker {
  readonly _attributes: string[];
  readonly _context: BrowserContext;
  protected _frameCount = 0;
  readonly _frameIdsByFrame = new Map<Frame, number>();
  readonly _framesById = new Map<number, Frame>();
  readonly _frameSelectors = new Map<Frame, string>();

  constructor(options: FrameTrackerConstructorOptions) {
    const { attributes, context } = options;
    if (!context)
      throw new Error(
        "FrameTracker cannot be initialized without a Playwright BrowserContext instance"
      );
    this._attributes = attributes || [];
    this._context = context;
  }

  /**
   * @summary Creates or updates the selector for a frame. Pass `frame` by
   *   reference if you have it, or the `frameId` if you don't.
   */
  async _updateSelectorForFrame({
    frame,
    frameId,
  }: UpdateSelectorForFrameOptions): Promise<void> {
    if (frameId !== undefined) {
      frame = this._framesById.get(frameId);
      if (!frame) throw new Error(`No frame found with ID ${frameId}`);
    } else if (frame) {
      frameId = this._frameIdsByFrame.get(frame);
      if (typeof frameId !== "number") {
        frameId = this._frameCount;
        this._frameCount += 1;

        // Keep this before the `buildFrameSelector` call because in some cases
        // an iframe attribute mutation might cause `_updateSelectorForFrame`
        // to be called again for the same frame before `buildFrameSelector`
        // resolves.
        this._framesById.set(frameId, frame);
        this._frameIdsByFrame.set(frame, frameId);
      }
    } else {
      throw new Error("Either frame or frameId is required");
    }

    const { isHidden, selector } = await buildFrameSelector(
      frame,
      frameId!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
      this._attributes
    );

    if (!selector) {
      // If frame is detached, nested, or the main frame, we don't need to track.
      // If it's hidden, this could change as its attributes change, so we'll
      // continue to track.
      if (!isHidden) this._forgetFrame(frame);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this._frameSelectors.set(frame!, selector);
  }

  private _forgetFrame(frame: Frame) {
    // Clear references to allow garbage collection
    const frameId = this._frameIdsByFrame.get(frame);
    if (frameId) {
      debug(`Forgetting frame with ID ${frameId}`);
      this._frameIdsByFrame.delete(frame);
      this._framesById.delete(frameId);
    }
    this._frameSelectors.delete(frame);
  }

  public getFrameSelector(frame: Frame): string | undefined {
    return this._frameSelectors.get(frame);
  }

  public async trackFrames(): Promise<void> {
    await this._context.exposeBinding(
      "qawFrameSelectorChange",
      async ({ page }: BindingOptions, frameId: number) => {
        if (frameId === null || frameId === undefined) {
          throw new Error(
            `qawFrameSelectorChange called with invalid frameId: ${frameId}`
          );
        }
        if (page.isClosed()) return;

        try {
          await this._updateSelectorForFrame({ frameId });
        } catch (error) {
          debug(`cannot update frame selector: ${error.message}`);
        }
      }
    );

    await forEachFrame(this._context, async ({ frame }) => {
      debug("forEachFrame: called");
      // eagerly build frame selectors so we have them after a page navigation
      try {
        await this._updateSelectorForFrame({ frame });
      } catch (error) {
        debug(`cannot build frame selector: ${error.message}`);
      }
    });

    await forEachPage(this._context, (page) => {
      page.on("framedetached", this._forgetFrame.bind(this));

      page.on("close", () => {
        page.frames().forEach((frame: Frame) => {
          this._forgetFrame(frame);
        });
      });
    });
  }
}
