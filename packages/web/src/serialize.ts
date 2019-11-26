import { parse as parseHtml, IDoc } from "html-parse-stringify";
import "./html-parse-stringify";

export type DocTarget = {
  node: IDoc;
  ancestors: IDoc[];
};

export type HtmlTarget = {
  node: string;
  ancestors: string[];
};

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

export const nodeToHtmlTarget = (
  node: Node,
  numAncestors: number = 2
): HtmlTarget => {
  /**
   * Serialize a node (deep) and it's ancestors (shallow).
   */

  const nodeHtml: string = nodeToHtml(node);

  let ancestorsHtml: string[] = [];

  let ancestor = node.parentNode;
  for (let i = 0; ancestor && i < numAncestors; i++) {
    let ancestorWithoutSiblings = ancestor.cloneNode(false);
    ancestorsHtml.push(nodeToHtml(ancestorWithoutSiblings));
    ancestor = ancestor.parentNode;
  }

  return { node: nodeHtml, ancestors: ancestorsHtml };
};

export const htmlTargetToDoc = (target: HtmlTarget): DocTarget => {
  const nodeDoc = htmlToDoc(target.node);
  const ancestorsDoc = target.ancestors.map(a => htmlToDoc(a));

  return {
    node: nodeDoc,
    ancestors: ancestorsDoc
  };
};
