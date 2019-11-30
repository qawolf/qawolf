import { Doc, DocSelector, DocSelectorSerialized } from "@qawolf/types";
import { parse as parseHtml } from "html-parse-stringify";
import "./types";

export const deserializeDocSelector = (
  serialized: DocSelectorSerialized
): DocSelector => {
  const node = htmlToDoc(serialized.node);
  const ancestors = serialized.ancestors.map((a: string) => htmlToDoc(a));

  return {
    node,
    ancestors
  };
};

export const htmlToDoc = (html: string): Doc => {
  const result = parseHtml(html);
  if (result.length !== 1) {
    console.log("invalid html", html, result);
    throw new Error("htmlToDoc: only supports individual nodes");
  }

  return result[0];
};

export const nodeToDocSelector = (
  node: Node,
  numAncestors: number = 2
): DocSelector => {
  /**
   * Serialize a node (deep) and it's ancestors (shallow).
   */
  const nodeHtml: string = nodeToHtml(node, true);

  let ancestorsHtml: string[] = [];

  let ancestor = node.parentNode;
  for (let i = 0; ancestor && i < numAncestors; i++) {
    let ancestorWithoutSiblings = ancestor.cloneNode(false);
    const ancestorHtml = nodeToHtml(ancestorWithoutSiblings);

    if (ancestorHtml.length) ancestorsHtml.push(ancestorHtml);
    ancestor = ancestor.parentNode;
  }

  return deserializeDocSelector({ node: nodeHtml, ancestors: ancestorsHtml });
};

export const nodeToHtml = (
  node: Node,
  includeInnerText: boolean = false
): string => {
  const serializer = new XMLSerializer();

  const element = node as HTMLElement;
  if (includeInnerText && element.innerText) {
    element.setAttribute("innerText", element.innerText);
  }

  const serialized = serializer
    .serializeToString(node)
    .replace(/ xmlns=\"(.*?)\"/g, "") // remove namespace
    .replace(/(\r\n|\n|\r)/gm, ""); // remove newlines

  if (includeInnerText && element.innerText) {
    element.removeAttribute("innerText");
  }

  return serialized;
};
