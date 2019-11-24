export const nodeToString = (node: Node) => {
  var serializer = new XMLSerializer();
  return serializer
    .serializeToString(node)
    .replace(/xmlns=\"(.*?)\" /g, "") // remove namespace
    .replace(/(\r\n|\n|\r)/gm, ""); // remove newlines
};

export const serializeNode = (target: Node, numAncestors: number = 2) => {
  /**
   * Serialize a node deep and it's ancestors shallow.
   */
  const serialized: string[] = [];

  // the target is the first item
  // so we can easily identify it amongst variable ancestors
  serialized.push(nodeToString(target));

  let ancestor = target.parentNode;
  for (let i = 0; ancestor && i < numAncestors; i++) {
    let ancestorWithoutSiblings = ancestor.cloneNode(false);
    serialized.push(nodeToString(ancestorWithoutSiblings));
    ancestor = ancestor.parentNode;
  }

  return serialized;
};
