import {
  Doc,
  DocSelector,
  DocSelectorSerialized,
  Workflow,
  WorkflowSerialized
} from "@qawolf/types";
import {
  parse as parseHtml,
  stringify as stringifyDocArray
} from "@jperl/html-parse-stringify";
import { cleanText } from "./lang";
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

export const deserializeWorkflow = (workflow: WorkflowSerialized) => {
  return {
    ...workflow,
    steps: workflow.steps.map(step => ({
      ...step,
      html: deserializeDocSelector(step.html)
    }))
  };
};

export const docToHtml = (doc: Doc) => stringifyDocArray([doc]);

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

  const nodeHtml: string = nodeToHtml(node, { innerText: true, labels: true });

  let ancestors: string[] = [];
  if (element.tagName !== "BODY" && element.tagName !== "HTML") {
    ancestors = getAncestorsHtml(node, numAncestors);
  }

  return deserializeDocSelector({
    ancestors,
    node: nodeHtml
  });
};

export const nodeToHtml = (
  node: Node,
  options: SerializeNodeOptions = {}
): string => {
  const serializer = new XMLSerializer();

  const element = node as HTMLInputElement;

  if (element.tagName === "HTML") {
    return "<html />";
  }

  if (element.tagName === "BODY") {
    return "<body />";
  }

  if (options.innerText && element.innerText) {
    // clean the text to prevent weird serialization of line breaks
    element.setAttribute("innertext", cleanText(element.innerText, false));
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
    element.removeAttribute("innertext");
  }

  if (options.labels) {
    element.removeAttribute("labels");
  }

  return serialized;
};

export const serializeDocSelector = (
  selector: DocSelector
): DocSelectorSerialized => {
  return {
    ancestors: selector.ancestors.map(ancestor => docToHtml(ancestor)),
    node: docToHtml(selector.node)
  };
};

export const serializeWorkflow = (workflow: Workflow): WorkflowSerialized => {
  return {
    ...workflow,
    steps: workflow.steps.map(step => ({
      ...step,
      html: serializeDocSelector(step.html)
    }))
  };
};
