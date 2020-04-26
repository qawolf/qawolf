// import { buildCues, buildSelectorForCues } from './cues';
// import { getXpath } from './xpath';

// export const buildSelector = (target: HTMLElement): string => {
//   const cues = buildCues({ attributes: [], target });

//   for (const cueGroup of combineCues(cues)) {
//     const selector = buildSelectorForCues(cueGroup);

//     if (isMatch({ selector, target })) {
//       return toSelectorString(selector);
//     }
//   }

//   return getXpath(target);
// };
