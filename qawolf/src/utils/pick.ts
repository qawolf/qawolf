// Since we only need this for now, we can avoid downloading lodash
const pick = (
  obj: Record<any, any>,
  props: readonly string[]
): Record<any, any> => {
  const newObj = {};
  for (const prop of props) {
    if ({}.hasOwnProperty.call(obj, prop)) {
      newObj[prop] = obj[prop];
    }
  }
  return newObj;
};

export default pick;
