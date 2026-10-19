import type { publicContractsV1 } from "@qawolf/api-contracts/v1";
import type { z } from "zod";

import type { BuiltAction } from "./browserAction.js";

export type RefAction = z.input<
  typeof publicContractsV1.runner.performRefAction.input
>["action"];

export const refVerbs = [
  "click",
  "dblclick",
  "fill",
  "hover",
  "select",
] as const;

type RefVerb = (typeof refVerbs)[number];

const isRefVerb = (verb: string): verb is RefVerb =>
  (refVerbs as readonly string[]).includes(verb);

/**
 * Turns `ref <verb> <ref> [value...]` into the action the platform takes.
 * `fill` takes exactly one value, `select` one or more, and the rest none.
 */
export function buildRefAction(options: {
  ref: string;
  values: string[];
  verb: string;
}): BuiltAction<RefAction> {
  const { ref, values, verb } = options;
  if (!isRefVerb(verb)) {
    return {
      error: `"${verb}" is not a ref action. Use one of: ${refVerbs.join(", ")}.`,
      ok: false,
    };
  }
  switch (verb) {
    case "fill": {
      const [text] = values;
      if (text === undefined || values.length > 1) {
        return {
          error:
            'fill takes the text to put in the field as one argument. Quote it if it has spaces, and pass "" to clear the field.',
          ok: false,
        };
      }
      return { action: { ref, text, type: "fill" }, ok: true };
    }
    case "select": {
      const [first, ...rest] = values;
      if (first === undefined) {
        return {
          error: "select takes one or more option values or labels to select.",
          ok: false,
        };
      }
      return {
        action: { ref, type: "select", values: [first, ...rest] },
        ok: true,
      };
    }
    case "click":
    case "dblclick":
    case "hover":
      if (values.length > 0) {
        return {
          error: `${verb} takes no value after the ref, and was given ${values.join(" ")}.`,
          ok: false,
        };
      }
      return {
        action: { ref, type: verb === "dblclick" ? "double-click" : verb },
        ok: true,
      };
    default:
      verb satisfies never;
      throw Error(`unhandled ref verb ${String(verb)}`);
  }
}
