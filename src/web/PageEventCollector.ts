import { buildCssSelector } from './buildCssSelector';
import { getClickableAncestor } from './element';
import { nodeToDoc, nodeToHtmlSelector } from './serialize';
import * as types from '../types';

type EventCallback = types.Callback<types.ElementEvent>;

type ConstructorOptions = {
  attribute: string;
  pageIndex: number;
  sendEvent: EventCallback;
};

export class PageEventCollector {
  private _attribute: string;
  private _onDispose: types.Callback[] = [];
  private _pageIndex: number;
  private _sendEvent: EventCallback;

  constructor(options: ConstructorOptions) {
    this._attribute = options.attribute;
    this._pageIndex = options.pageIndex;
    this._sendEvent = options.sendEvent;
    this.collectEvents();
    console.debug('PageEventCollector: created', options);
  }

  public dispose(): void {
    this._onDispose.forEach(d => d());
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
      document.removeEventListener(eventName, handler),
    );
  }

  private sendEvent<K extends keyof DocumentEventMap>(
    eventName: types.ElementEventName,
    event: DocumentEventMap[K],
    value?: string | types.ScrollValue | null,
  ): void {
    const target = event.target as HTMLElement;

    const elementEvent = {
      cssSelector: buildCssSelector({
        attribute: this._attribute,
        isClick: ['click', 'mousedown'].includes(eventName),
        target,
      }),
      htmlSelector: nodeToHtmlSelector(target, 2),
      isTrusted: event.isTrusted,
      name: eventName,
      page: this._pageIndex,
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
    this._sendEvent(elementEvent);
  }

  private collectEvents(): void {
    this.listen('mousedown', event => {
      // only the main button (not right clicks/etc)
      // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
      if (event.button !== 0) return;

      // getClickableAncestor chooses the top most clickable ancestor.
      // The ancestor is likely a better target than the descendant.
      // Ex. when you click on the i (button > i) or rect (a > svg > rect)
      // chances are the ancestor (button, a) is a better target to find.
      // XXX if anyone runs into issues with this behavior we can allow disabling it from a flag.
      const target = getClickableAncestor(event.target as HTMLElement);
      this.sendEvent('mousedown', { ...event, target });
    });

    this.listen('click', event => {
      if (event.button !== 0) return;

      const target = getClickableAncestor(event.target as HTMLElement);
      this.sendEvent('click', { ...event, target });
    });

    this.listen('input', event => {
      const target = event.target as HTMLInputElement;
      // ignore input events not on selects
      // other input events are captured in click and type listeners
      if (target.tagName.toLowerCase() !== 'select') return;

      this.sendEvent('input', event, target.value);
    });

    this.listen('keydown', event => {
      this.sendEvent('keydown', event, event.key);
    });

    this.listen('keyup', event => {
      this.sendEvent('keyup', event, event.key);
    });

    this.listen('paste', event => {
      if (!event.clipboardData) return;

      const value = event.clipboardData.getData('text');

      this.sendEvent('paste', event, value);
    });

    // XXX select only supports input/textarea
    // We can combine selectstart/mouseup to support content editables
    this.listen('select', event => {
      const target = event.target as HTMLInputElement;
      if (
        target.selectionStart !== 0 ||
        target.selectionEnd !== target.value.length
      ) {
        // Only record select all, not other selection events
        return;
      }

      this.sendEvent('selectall', event);
    });

    this.collectScrollEvent();
  }

  private collectScrollEvent(): void {
    let lastWheelEvent: WheelEvent | null = null;
    this.listen('wheel', ev => (lastWheelEvent = ev));

    // We record the scroll event and not the wheel event
    // because it fires after the element.scrollLeft & element.scrollTop are updated
    this.listen('scroll', event => {
      if (!lastWheelEvent || event.timeStamp - lastWheelEvent.timeStamp > 100) {
        // We record mouse wheel initiated scrolls only
        // to avoid recording system initiated scrolls (after selecting an item/etc).
        // This will not capture scrolls triggered by the keyboard (PgUp/PgDown/Space)
        // however we already record key events so that encompasses those.
        console.debug('ignore non-wheel s:croll event', event);
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
