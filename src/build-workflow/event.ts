import { ElementEvent } from '../types';

export const isKeyEvent = (event: ElementEvent | null): boolean =>
  event &&
  event.isTrusted &&
  (event.name === 'keydown' || event.name === 'keyup');

export const isPasteEvent = (event: ElementEvent | null): boolean =>
  event && event.isTrusted && event.name === 'paste';

export const isSelectAllEvent = (event: ElementEvent | null): boolean =>
  event && event.isTrusted && event.name === 'selectall';

export const isTypeEvent = (event: ElementEvent | null): boolean =>
  isKeyEvent(event) || isPasteEvent(event);
