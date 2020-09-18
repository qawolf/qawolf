import { getAttribute } from './attribute';
import { getElementText } from './selectorEngine';
import { getValueMatches, isDynamic } from './isDynamic';

const DYNAMIC_VALUE_OK_ATTRIBUTES = ['placeholder', 'href', 'src', 'value'];

export type Cue = {
  level: number; // 0 is target, 1 is parent, etc.
  penalty: number; // Cue type penalty plus PENALTY_PER_LEVEL
  type: string;
  value: string;
};

export type BuildCues = {
  cueTypesConfig: CueTypesConfig;
  isClick: boolean;
  target: HTMLElement;
};

type CueTypeConfig = {
  elements: string[];
  isPreferred?: boolean;
  penalty: number;
};

type CueTypesConfig = Record<string, CueTypeConfig>;

type BuildCuesForElement = {
  cueTypesConfig: CueTypesConfig;
  element: HTMLElement;
  isClick: boolean;
  level: number;
};

/**
 * For each cue type, this defines which elements it applies to and a penalty
 * value. Higher penalty means it is less likely that this will be helpful in
 * constructing a unique, short, and attractive selector. We can and should
 * work to fine tune the penalty values over time.
 *
 * Users may add attributes to this list using the `attribute` config option.
 */
const ConfigByCueType: CueTypesConfig = {
  alt: {
    elements: ['area', 'img', 'input[type=image]'],
    penalty: 20,
  },
  'aria-label': {
    elements: ['*'],
    penalty: 8,
  },
  class: {
    elements: ['*'],
    penalty: 10,
  },
  contenteditable: {
    elements: ['*'],
    // High penalty because it is unlikely to be unique given that the value is always the same
    penalty: 30,
  },
  for: {
    elements: ['label', 'output'],
    penalty: 5,
  },
  href: {
    elements: ['a'],
    penalty: 15,
  },
  id: {
    elements: ['*'],
    penalty: 5,
  },
  name: {
    elements: [
      'button',
      'form',
      'fieldset',
      'iframe',
      'input',
      'object',
      'output',
      'select',
      'textarea',
      'map',
    ],
    penalty: 10,
  },
  placeholder: {
    elements: ['input', 'textarea'],
    penalty: 12,
  },
  src: {
    elements: ['audio', 'iframe', 'img', 'input[type=image]', 'video'],
    penalty: 15,
  },
  tag: {
    elements: ['*'],
    penalty: 40,
  },
  text: {
    elements: ['*'],
    penalty: 12,
  },
  title: {
    elements: ['area', 'img', 'input[type=image]'],
    penalty: 20,
  },
  value: {
    elements: [
      'option',
      'button',
      'input[type=submit]',
      'input[type=button]',
      'input[type=checkbox]',
      'input[type=radio]',
    ],
    penalty: 10,
  },
};

/**
 * @summary Get final cue types config
 * @return Cue type config with preferred attributes added. For now,
 *   all attributes are given 0 penalty, but eventually the user
 *   config could support custom penalties for each.
 */
export const getCueTypesConfig = (attributes: string[]): CueTypesConfig => {
  const preferredAttributes: CueTypesConfig = {};

  attributes.forEach((attribute) => {
    preferredAttributes[attribute] = {
      elements: ['*'],
      isPreferred: true,
      penalty: 0,
    };
  }, {});

  return {
    ...ConfigByCueType,
    ...preferredAttributes,
  };
};

export const buildCueValueForTag = (element: HTMLElement): string => {
  const tagName = element.tagName.toLowerCase();
  if (!element.parentElement) return tagName;

  const siblings = element.parentElement.children;
  const sameTagSiblings: HTMLElement[] = [];

  for (const sibling of siblings) {
    if (sibling.tagName.toLowerCase() === tagName) {
      sameTagSiblings.push(sibling as HTMLElement);
    }
  }

  if (sameTagSiblings.length < 2) {
    return tagName;
  }

  const nthIndex = sameTagSiblings.indexOf(element) + 1;
  if (nthIndex === 1) return tagName;

  return `${tagName}:nth-of-type(${nthIndex})`;
};

export const buildCuesForElement = ({
  cueTypesConfig,
  element,
  isClick,
  level,
}: BuildCuesForElement): Cue[] => {
  // For body and html, we never have more than one, so
  // just 'tag' cue is needed and we can save some time.
  const tagName = element.tagName.toLowerCase();
  if (['html', 'body'].includes(tagName)) {
    return [
      {
        level,
        penalty: ConfigByCueType.tag.penalty,
        type: 'tag',
        value: tagName,
      },
    ];
  }

  const cues: Cue[] = Object.keys(cueTypesConfig).reduce((list, cueType) => {
    const { elements, isPreferred, penalty } = cueTypesConfig[cueType];

    // First find out whether this cue type is relevant for this element
    if (!elements.some((selector: string) => element.matches(selector))) {
      return list;
    }

    switch (cueType) {
      // Special handling for "class" attribute
      case 'class': {
        element.classList.forEach((c) => {
          if (isDynamic(c)) return;

          list.push({
            level,
            penalty,
            type: 'class',
            value: `.${CSS.escape(c)}`,
          });
        });
        break;
      }
      // Special handling for "id" attribute
      case 'id': {
        const elementId = element.id;
        if (elementId && !isDynamic(elementId)) {
          list.push({
            level,
            penalty,
            type: 'id',
            value: `#${CSS.escape(elementId)}`,
          });
        }
        break;
      }
      // Special handling for "tag" type
      case 'tag':
        list.push({
          level,
          penalty,
          type: 'tag',
          value: buildCueValueForTag(element),
        });
        break;
      // Special handling for "text" type
      case 'text': {
        if (!isClick) return list;
        const value = getElementText(element);
        if (value) {
          list.push({ level, penalty, type: 'text', value });
        }
        break;
      }
      // Everything else is just an attribute
      default: {
        const attributeValuePair = getAttribute({
          attribute: cueType,
          element,
        });
        if (attributeValuePair) {
          const { name, value } = attributeValuePair;
          if (value.length && (isPreferred || DYNAMIC_VALUE_OK_ATTRIBUTES.includes(name))) {
            list.push({
              level,
              penalty,
              type: 'attribute',
              value: `[${name}="${value}"]`,
            });
          } else {
            getValueMatches(value).forEach(({ match, operator }) => {
              list.push({
                level,
                penalty,
                type: 'attribute',
                value: `[${name}${operator}"${match}"]`,
              });
            });
          }
        }
        break;
      }
    }

    return list;
  }, []);

  return cues;
};

export const buildCues = ({
  cueTypesConfig,
  isClick,
  target,
}: BuildCues): Cue[] => {
  const cues: Cue[] = [];
  let element: HTMLElement = target;
  let level = 0;

  while (element) {
    cues.push(
      ...buildCuesForElement({ cueTypesConfig, element, isClick, level }),
    );

    element = element.parentElement;
    level += 1;
  }

  return cues;
};

export const findNearestPreferredAttributeCue = (cues: Cue[]): Cue | null => {
  return cues.reduce((foundCue, cue) => {
    if (cue.penalty === 0 && (!foundCue || foundCue.level > cue.level)) {
      return cue;
    }

    return foundCue;
  }, null);
};

export const getPenalty = (cues: Cue[]): number => {
  return cues.reduce((a, b) => a + b.penalty, 0);
};

export const getValueLength = (cues: Cue[]): number => {
  return cues.reduce((total, cue) => total + cue.value.length, 0);
};
