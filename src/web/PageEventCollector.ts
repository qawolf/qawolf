import { DEFAULT_ATTRIBUTE_LIST } from './attribute';
import {
  getInputElementValue,
  getTopmostEditableElement,
  isVisible,
} from './element';
import { buildSelector } from './selector';
import { nodeToDoc } from './serialize';
import * as types from '../types';

type EventCallback = types.Callback<types.ElementEvent>;

type ConstructorOptions = {
  attribute?: string;
};

export class PageEventCollector {
  private _attributes: string[];
  private _onDispose: types.Callback[] = [];

  constructor(options: ConstructorOptions) {
    this._attributes = (options.attribute || DEFAULT_ATTRIBUTE_LIST).split(',');
    this.collectEvents();
    console.debug('PageEventCollector: created', options);
  }

  public dispose(): void {
    this._onDispose.forEach((d) => d());
    console.debug('PageEventCollector: disposed');
  }

  private listen<K extends keyof DocumentEventMap>(
    eventName: K,
    handler: (ev: DocumentEventMap[K]) => any,
  ): void {
    document.addEventListener(eventName, handler, {
      capture: true,
      passive: true,
    });

    this._onDispose.push(() =>
      document.removeEventListener(eventName, handler, {
        // `capture` value must match for proper removal
        // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener#Matching_event_listeners_for_removal
        capture: true,
      }),
    );
  }

  private sendEvent<K extends keyof DocumentEventMap>(
    eventName: types.ElementEventName,
    event: DocumentEventMap[K],
    value?: string | types.ScrollValue | null,
  ): void {
    const eventCallback: EventCallback = (window as any).qawElementEvent;
    if (!eventCallback) return;

    const isClick = ['click', 'mousedown'].includes(eventName);

    const target = getTopmostEditableElement(event.target as HTMLElement);

    const isTargetVisible = isVisible(target, window.getComputedStyle(target));

    const selector = buildSelector({
      attributes: this._attributes,
      isClick,
      target,
    });

    const elementEvent: types.ElementEvent = {
      isTrusted: event.isTrusted && isTargetVisible,
      name: eventName,
      page: -1, // set in ContextEventCollector
      selector,
      target: nodeToDoc(target),
      time: Date.now(),
      value,
    };

    console.debug(
      `PageEventCollector: ${eventName} event`,
      event,
      event.target,
      'recorded:',
      elementEvent,
    );

    eventCallback(elementEvent);
  }

  private collectEvents(): void {
    //////// MOUSE EVENTS ////////

    this.listen('mousedown', (event) => {
      // only the main button (not right clicks/etc)
      // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
      if (event.button !== 0) return;

      this.sendEvent('mousedown', event);
    });

    this.listen('click', (event) => {
      // only the main button (not right clicks/etc)
      // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
      if (event.button !== 0) return;

      this.sendEvent('click', event);
    });

    //////// INPUT EVENTS ////////

    this.listen('input', (event) => {
      const target = event.target as HTMLInputElement;
      this.sendEvent('input', event, getInputElementValue(target));
    });

    this.listen('change', (event) => {
      const target = event.target as HTMLInputElement;
      this.sendEvent('change', event, getInputElementValue(target));
    });

    //////// KEYBOARD EVENTS ////////

    this.listen('keydown', (event) => {
      this.sendEvent('keydown', event, event.key);
    });

    this.listen('keyup', (event) => {
      this.sendEvent('keyup', event, event.key);
    });

    //////// OTHER EVENTS ////////

    this.listen('paste', (event) => {
      if (!event.clipboardData) return;

      const value = event.clipboardData.getData('text');

      this.sendEvent('paste', event, value);
    });

    this.collectScrollEvent();
  }

  private collectScrollEvent(): void {
    let lastWheelEvent: WheelEvent | null = null;
    this.listen('wheel', (ev) => (lastWheelEvent = ev));

    // We record the scroll event and not the wheel event
    // because it fires after the element.scrollLeft & element.scrollTop are updated
    this.listen('scroll', (event) => {
      if (!lastWheelEvent || event.timeStamp - lastWheelEvent.timeStamp > 100) {
        // We record mouse wheel initiated scrolls only
        // to avoid recording system initiated scrolls (after selecting an item/etc).
        // This will not capture scrolls triggered by the keyboard (PgUp/PgDown/Space)
        // however we already record key events so that encompasses those.
        return;
      }

      let target = event.target as HTMLElement;
      if (event.target === document || event.target === document.body) {
        target = (document.scrollingElement ||
          document.documentElement) as HTMLElement;
      }

      const value = {
        x: target.scrollLeft,
        y: target.scrollTop,
      };

      this.sendEvent('scroll', { ...event, target }, value);
    });
  }
}
