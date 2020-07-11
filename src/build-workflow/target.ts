import { Doc } from '../types';

export const isContentEditableTarget = (target: Doc): boolean => {
  const { contenteditable } = target.attrs || {};
  return contenteditable && contenteditable !== "false";
}

export const isInputTarget = (target: Doc): boolean => {
  const name = target.name || '';
  return name.toLowerCase() === 'input';
}

export const isTextareaTarget = (target: Doc): boolean => {
  const name = target.name || '';
  return name.toLowerCase() === 'textarea';
}
