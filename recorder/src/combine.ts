const doCombine = <T>(
  items: T[],
  remaining: number,
  combination: T[],
  result: T[][]
) => {
  if (remaining === 0) {
    if (combination.length > 0) {
      result.push(combination);
    }
    return;
  }

  // For each item
  for (let i = 0; i < items.length; i++) {
    doCombine(
      // Combine the later items
      items.slice(i + 1),
      // Recursively add items until we reach the correct size
      remaining - 1,
      // Include the item in the selection
      combination.concat([items[i]]),
      result
    );
  }
  return;
};

/**
 * Build all combinations of items with the specified size.
 */
export const combine = <T>(items: T[], size: number): T[][] => {
  const result = [];

  doCombine(items, size, [], result);

  return result;
};
