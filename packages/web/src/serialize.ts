import { Doc, DocSelector, HtmlSelector } from "@qawolf/types";
import { parse as parseHtml } from "html-parse-stringify";
import "./html-parse-stringify";

export const htmlToDoc = (html: string): Doc => {
  const result = parseHtml(html);
  if (result.length !== 1) {
    console.log("invalid html", html, result);
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

export const nodeToHtmlSelector = (
  node: Node,
  numAncestors: number = 2
): HtmlSelector => {
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

export const nodeToDocSelector = (
  node: Node,
  numAncestors: number = 2
): DocSelector => {
  const htmlSelector = nodeToHtmlSelector(node, numAncestors);
  return htmlToDocSelector(htmlSelector);
};

export const htmlToDocSelector = (selector: HtmlSelector): DocSelector => {
  const node = htmlToDoc(selector.node);
  const ancestors = selector.ancestors.map(a => htmlToDoc(a));

  const docSelector = {
    node,
    ancestors
  };
  return docSelector;
};
