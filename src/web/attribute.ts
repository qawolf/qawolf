export const DEFAULT_ATTRIBUTE_LIST =
  'data-cy,data-e2e,data-qa,/^data-test.*/,/^qa-.*/';

export type AttributeValuePair = {
  name: string;
  value: string;
};

type GetAttribueValue = {
  attribute: string;
  element: HTMLElement;
};

type GetRegexAttribute = {
  element: HTMLElement;
  regexString: string;
};

export const deserializeRegex = (regexString: string): RegExp | null => {
  try {
    const parts = regexString.match(/\/(.*)\/(.*)?/) as RegExpMatchArray;

    return new RegExp(parts[1], parts[2] || '');
  } catch (e) {
    console.error(
      `qawolf: invalid regex attribute ${regexString}, skipping this attribute`,
    );
    return null;
  }
};

export const getRegexAttribute = ({
  element,
  regexString,
}: GetRegexAttribute): AttributeValuePair | null => {
  const regex = deserializeRegex(regexString);
  if (!regex) return null;

  const attributes = element.attributes;

  for (let i = 0; i < attributes.length; i++) {
    const { name, value } = attributes[i];

    if (name.match(regex)) {
      return { name, value };
    }
  }

  return null;
};

export const getAttribute = ({
  attribute,
  element,
}: GetAttribueValue): AttributeValuePair | null => {
  const isRegex = attribute[0] === '/';

  if (isRegex) {
    return getRegexAttribute({
      element,
      regexString: attribute,
    });
  }

  const value = element.getAttribute(attribute);
  if (!value) return null;

  return { name: attribute, value };
};

export const hasAttribute = (
  element: HTMLElement,
  attributes: string[],
): boolean => {
  return !!attributes.find((attribute) => getAttribute({ attribute, element }));
};
