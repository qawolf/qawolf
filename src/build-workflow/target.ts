import { Doc } from '../types';

export const isInputTarget = (target: Doc): boolean => {
  const name = target.name || '';
  return name.toLowerCase() === 'input';
}

export const isTextareaTarget = (target: Doc): boolean => {
  const name = target.name || '';
  return name.toLowerCase() === 'textarea';
}
