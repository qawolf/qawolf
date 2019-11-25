import { parse as parseHtml, IDoc } from "html-parse-stringify";
import "./html-parse-stringify";

export type Target = string[];

export const htmlToDoc = (html: string): IDoc => {
  const result = parseHtml(html);
  if (result.length !== 1) {
    throw new Error("htmlToDoc: only supports individual nodes");
  }

  return result[0];
};

export const nodeToHtml = (node: Node): string => {
  var serializer = new XMLSerializer();
  return serializer
    .serializeToString(node)
    .replace(/xmlns=\"(.*?)\" /g, "") // remove namespace
    .replace(/(\r\n|\n|\r)/gm, ""); // remove newlines
};

export const nodeToTarget = (
  targetNode: Node,
  numAncestors: number = 2
): Target => {
  /**
   * Serialize a node (deep) and it's ancestors (shallow).
   */
  const serialized: string[] = [];

  // the targetNode is the first item
  // so we can easily identify it amongst variable ancestors
  serialized.push(nodeToHtml(targetNode));

  let ancestor = targetNode.parentNode;
  for (let i = 0; ancestor && i < numAncestors; i++) {
    let ancestorWithoutSiblings = ancestor.cloneNode(false);
    serialized.push(nodeToHtml(ancestorWithoutSiblings));
    ancestor = ancestor.parentNode;
  }

  return serialized;
};

export const targetToDocs = (target: Target): IDoc[] => {
  return target.map(html => htmlToDoc(html));
};
