export const nodeToString = (node: Node) => {
  var serializer = new XMLSerializer();
  return serializer
    .serializeToString(node)
    .replace(/xmlns=\"(.*?)\" /g, "") // remove namespace
    .replace(/(\r\n|\n|\r)/gm, ""); // remove newlines
};

export const cloneWithAncestors = (target: Node, numAncestors: number = 2) => {
  /**
   * Clone a node deep with ancestors, without siblings.
   */
  let clone = target.cloneNode(true);

  let ancestor = target.parentNode;
  for (let i = 0; ancestor && i < numAncestors; i++) {
    // clone the ancestor shallow
    let ancestorClone = ancestor.cloneNode(false);
    ancestorClone.appendChild(clone);
    clone = ancestorClone;
    ancestor = ancestor.parentNode;
  }

  return clone;
};

export const serializeNode = (node: Node) => {
  return nodeToString(cloneWithAncestors(node));
};
