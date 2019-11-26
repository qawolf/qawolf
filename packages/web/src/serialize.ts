import { Doc, DocTarget, HtmlTarget } from "@qawolf/types";
import { parse as parseHtml } from "html-parse-stringify";
import "./html-parse-stringify";

export const htmlToDoc = (html: string): Doc => {
  const result = parseHtml(html);
  if (result.length !== 1) {
    console.log("invalid html", html);
    debugger;
    throw new Error("htmlToDoc: only supports individual nodes");
  }

  return result[0];
};

export const nodeToHtml = (node: Node): string => {
  var serializer = new XMLSerializer();
  return serializer
    .serializeToString(node)
    .replace(/ xmlns=\"(.*?)\"/g, "") // remove namespace
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
    const ancestorHtml = nodeToHtml(ancestorWithoutSiblings);

    if (ancestorHtml.length) ancestorsHtml.push(ancestorHtml);
    ancestor = ancestor.parentNode;
  }

  return { node: nodeHtml, ancestors: ancestorsHtml };
};

export const nodeToDocTarget = (
  node: Node,
  numAncestors: number = 2
): DocTarget => {
  const htmlTarget = nodeToHtmlTarget(node, numAncestors);
  return htmlToDocTarget(htmlTarget);
};

export const htmlToDocTarget = (target: HtmlTarget): DocTarget => {
  const node = htmlToDoc(target.node);
  const ancestors = target.ancestors.map(a => htmlToDoc(a));

  const docTarget = {
    node,
    ancestors
  };
  return docTarget;
};
