import { elementText } from "./element";
import { Cue, Evaluator } from "./types";

let evaluator: Evaluator;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  evaluator = require("playwright-evaluator");
} catch (e) {
  // this will only error on server side tests that
  // do not require the evaluator but depend on this file
}

export const buildSelectorForCues = (cues: Cue[]): string => {
  const levels = [...new Set(cues.map((cue) => cue.level))];

  // sort descending
  levels.sort((a, b) => b - a);

  const parts = [];

  let useMultipleEngines = false;

  levels.forEach((level) => {
    const cuesForLevel = cues.filter((cue) => cue.level === level);

    const textCues = cuesForLevel.filter((cue) => cue.type === "text");
    if (textCues.length === 1) {
      parts.push(`text=${textCues[0].value}`);
      useMultipleEngines = true;
      return;
    }

    cuesForLevel.sort((a, b) => {
      if (a.type === "tag") return -1;
      if (b.type === "tag") return 1;
      return 0;
    });

    const cssSelector = cuesForLevel
      .map((cue) =>
        cue.type === "text" ? `:has-text("${cue.value}")` : cue.value
      )
      .join("");
    parts.push(cssSelector);
  });

  return useMultipleEngines ? parts.join(" >> ") : parts.join(" ");
};

export const buildElementText = (element: HTMLElement): string => {
  const text = elementText(element).trim();
  return text.length > 100 ? "" : text;
};

export const evaluatorQuerySelector = (
  selector: string,
  root?: Node
): HTMLElement => {
  return evaluator.querySelector(selector, root || document);
};

export const isMatch = (selector: string, target: Node): boolean => {
  // We must pass `target.ownerDocument` rather than `document`
  // because sometimes this is called from other frames.
  const result = evaluatorQuerySelector(selector, target.ownerDocument);

  return result === target;
};
