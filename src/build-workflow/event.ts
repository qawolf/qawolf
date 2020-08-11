import { ElementEvent } from '../types';

export const isChangeEvent = (event: ElementEvent | null): boolean =>
  event && event.isTrusted && event.name === 'change';

export const isInputEvent = (event: ElementEvent | null): boolean =>
  event && event.isTrusted && event.name === 'input';

export const isKeyEvent = (event: ElementEvent | null): boolean =>
  event &&
  event.isTrusted &&
  (event.name === 'keydown' || event.name === 'keyup');

export const isPasteEvent = (event: ElementEvent | null): boolean =>
  event && event.isTrusted && event.name === 'paste';
