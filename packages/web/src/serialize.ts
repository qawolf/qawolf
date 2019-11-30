import { Doc, DocSelector, DocSelectorSerialized } from "@qawolf/types";
import { parse as parseHtml } from "html-parse-stringify";
import "./types";

type SerializeNodeOptions = {
  innerText?: boolean;
  labels?: boolean;
};

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

const getAncestorsHtml = (node: Node, numAncestors: number): string[] => {
  const ancestorsHtml: string[] = [];

  let ancestor = node.parentNode;
  for (let i = 0; ancestor && i < numAncestors; i++) {
    let ancestorWithoutSiblings = ancestor.cloneNode(false);
    const ancestorHtml = nodeToHtml(ancestorWithoutSiblings);

    if (ancestorHtml.length) ancestorsHtml.push(ancestorHtml);
    ancestor = ancestor.parentNode;
  }

  return ancestorsHtml;
};

export const nodeToDocSelector = (
  node: Node,
  numAncestors: number = 2
): DocSelector => {
  /**
   * Serialize a node (deep) and it's ancestors (shallow).
   */

  const element = node as HTMLElement;

  let ancestors: string[] = [];
  let nodeHtml: string;

  // serialize body & html just by their tags
  // this is to prevent serializing a bunch of unnecessary metadata
  if (element.tagName === "BODY") {
    nodeHtml = "<body />";
  } else if (element.tagName === "HTML") {
    nodeHtml = "<html />";
  } else {
    nodeHtml = nodeToHtml(node, { innerText: true, labels: true });
    ancestors = getAncestorsHtml(node, numAncestors);
  }

  return deserializeDocSelector({
    node: nodeHtml,
    ancestors
  });
};

export const nodeToHtml = (
  node: Node,
  options: SerializeNodeOptions = {}
): string => {
  const serializer = new XMLSerializer();

  const element = node as HTMLInputElement;

  if (options.innerText && element.innerText) {
    element.setAttribute("innerText", element.innerText);
  }

  if (options.labels && element.labels) {
    const labels: string[] = [];

    element.labels.forEach(label => {
      if (label.innerText.length) labels.push(label.innerText);
    });

    if (labels.length) {
      element.setAttribute("labels", labels.join(" "));
    }
  }

  const serialized = serializer
    .serializeToString(node)
    .replace(/ xmlns=\"(.*?)\"/g, "") // remove namespace
    .replace(/(\r\n|\n|\r)/gm, ""); // remove newlines

  if (options.innerText) {
    element.removeAttribute("innerText");
  }

  if (options.labels) {
    element.removeAttribute("labels");
  }

  return serialized;
};
