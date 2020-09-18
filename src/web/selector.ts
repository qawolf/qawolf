import {
  buildCues,
  buildCuesForElement,
  Cue,
  getCueTypesConfig,
} from './cues';
import { getClickableGroup } from './element';
import {
  CueGroup,
  findOptimalCueGroups,
  pickBestCueGroup,
} from './optimizeCues';
import { getXpath } from './serialize';
import { getElementMatchingSelectorParts, isMatch } from './selectorEngine';
import { SelectorPart } from './types';

type BuildSelectorOptions = {
  attributes: string[];
  isClick: boolean;
  target: HTMLElement;
};

type CachedSelectorInfo = {
  matchedTarget: HTMLElement;
  selector: string;
  selectorParts: SelectorPart[];
};

type CuesForLevel = {
  cues: Cue[],
  level: number;
};

const selectorCache = new Map<HTMLElement, CachedSelectorInfo>();
const clickSelectorCache = new Map<HTMLElement, CachedSelectorInfo>();

/**
 * @summary Clear the selector cache. Currently only used for tests.
 */
export const clearSelectorCache = (): void => {
  selectorCache.clear();
  clickSelectorCache.clear();
};

export const toSelector = (selectorParts: SelectorPart[]): string => {
  const names = selectorParts.map((s) => s.name);

  // CSS selector
  if (!names.includes('text')) {
    return selectorParts.map((s) => s.body).join(' ');
  }

  // mixed selector
  return selectorParts.map(({ body, name }) => `${name}=${body}`).join(' >> ');
};

export const buildSelector = (options: BuildSelectorOptions): string => {
  const { attributes, isClick, target } = options;

  // To save looping, see if we have already figured out a unique
  // selector for this target.
  let cachedSelectorInfo: CachedSelectorInfo;
  if (isClick) {
    cachedSelectorInfo = clickSelectorCache.get(target);
  } else {
    cachedSelectorInfo = selectorCache.get(target);
  }

  let selector: string;
  if (cachedSelectorInfo) {
    const { matchedTarget, selector, selectorParts } = cachedSelectorInfo;
    // Even if we have cached a selector, it is possible that the DOM
    // has changed since the cached one was built. Confirm it's a match.
    if (isMatch({ selectorParts, target: matchedTarget })) {
      // console.debug('Using cached selector', selector, 'for target', target);
      return selector;
    }
  }

  const cuesByTarget = new Map<HTMLElement, CuesForLevel>();
  const cueTypesConfig = getCueTypesConfig(attributes);

  let targetGroup: HTMLElement[] = [];
  if (isClick) {
    // For a click, we consider the entire potential block of elements that we can
    // reasonably assume would call the same click handler when clicked.
    targetGroup = getClickableGroup(target, (element: HTMLElement, depth: number) => {
      let elementCues: Cue[];

      // For the level, we temporarily use negatives, which we'll fix later
      const level = 0 - depth;

      if (depth === 0) {
        // For the topmost element in the group, we build cues
        // for every ancestor element to the document root.
        elementCues = buildCues({ cueTypesConfig, isClick, target: element });
      } else {
        // For lower elements, start with the parent cues and then
        // add cues for this element to the beginning of the list
        const { cues: parentCues } = cuesByTarget.get(element.parentElement) || {};
        elementCues = [...buildCuesForElement({ cueTypesConfig, element, isClick, level }), ...parentCues];
      }

      cuesByTarget.set(element, { cues: elementCues, level });
    });
  }

  // getClickableGroup may have returned an empty array or it may not have been a click.
  // In either case, fall back to building a selector using only cues from the event target.
  if (targetGroup.length === 0) {
    targetGroup = [target];
    const targetCues = buildCues({ cueTypesConfig, isClick, target });
    cuesByTarget.set(target, { cues: targetCues, level: 0 });
  }

  const cueGroups: CueGroup[] = [];

  targetGroup.forEach((targetElement) => {
    const { cues, level } = cuesByTarget.get(targetElement);

    // First, if we have negative levels due to there being a target group,
    // fix them all to be zero-based.
    let rebasedCues: Cue[];
    if (level < 0) {
      rebasedCues = cues.map((cue) => ({
        ...cue,
        level: cue.level + (0 - level),
      }));
    } else {
      rebasedCues = cues;
    }

    // Examine the cues in the context of this potential target element, trying to
    // find any acceptable cue groups.
    findOptimalCueGroups({
      cues: rebasedCues,
      // This is called once for each acceptable cue group, which we then add to our
      // list of potential "best groups"
      onFound(cueGroup: CueGroup) {
        cueGroups.push(cueGroup);
      },
      target: targetElement,
      targetGroup,
    });
  });

  // Now pick the one best of the best possible cue groups and build a selector from it
  const { selectorParts } = pickBestCueGroup(cueGroups) || {};
  if (selectorParts) {
    // Convert selectorParts (a Playwright thing) to a string selector
    selector = toSelector(selectorParts);

    // This selector should match one of the elements in `targetGroup`, but it
    // may not be the original target. If so, determine what the matched target is.
    let matchedTarget: HTMLElement;
    if (targetGroup.length === 1 && targetGroup[0] === target) {
      matchedTarget = target;
    } else {
      // We must pass `target.ownerDocument` rather than `document`
      // because sometimes this is called from other frames.
      matchedTarget = getElementMatchingSelectorParts(selectorParts, target.ownerDocument);
    }

    // Cache it so that we don't need to do all the looping for this
    // same target next time. We cache `selectorParts` along with `selector`
    // because the DOM can change, so when we later use the cached selector,
    // we will need to run it through `isMatch` again, which needs the parsed
    // selector.
    const selectorInfo: CachedSelectorInfo = {
      matchedTarget,
      selector,
      selectorParts,
    };
    if (isClick) {
      clickSelectorCache.set(target, selectorInfo);
    } else {
      selectorCache.set(target, selectorInfo);
    }
  } else {
    // No selector was found, fall back to xpath.
    selector = `xpath=${getXpath(target)}`;
  }

  // console.debug('Built selector', selector, 'for target', target);
  return selector;
};
