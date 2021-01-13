import { shouldTrackKeyPress } from "./../src/shouldTrackKeyPress";
import { Doc } from "../src/types";

function doc(name: string, isContentEditable = false): Doc {
  return {
    name,
    attrs: {
      contenteditable: isContentEditable ? "true" : undefined,
    },
  };
}

it("pressing Enter with focus on non-input creates a press step", async () => {
  expect(shouldTrackKeyPress("Enter", doc("body"))).toBe(true);
});

it("pressing Enter with focus on text input creates a press step", async () => {
  expect(shouldTrackKeyPress("Enter", doc("input"))).toBe(true);
});

it("pressing Enter with focus on textarea does not create a press step", async () => {
  expect(shouldTrackKeyPress("Enter", doc("textarea"))).toBe(false);
});

it("pressing Enter with focus on contenteditable element does not create a press step", async () => {
  expect(shouldTrackKeyPress("Enter", doc("div", true))).toBe(false);
});

it("pressing Tab with focus on non-input creates a press step", async () => {
  expect(shouldTrackKeyPress("Tab", doc("body"))).toBe(true);
});

it("pressing Tab with focus on text input creates a press step", async () => {
  expect(shouldTrackKeyPress("Tab", doc("input"))).toBe(true);
});

it("pressing Tab with focus on textarea creates a press step", async () => {
  expect(shouldTrackKeyPress("Tab", doc("textarea"))).toBe(true);
});

it("pressing Tab with focus on contenteditable element creates a press step", async () => {
  expect(shouldTrackKeyPress("Tab", doc("div", true))).toBe(true);
});

it("pressing Escape with focus on non-input creates a press step", async () => {
  expect(shouldTrackKeyPress("Escape", doc("body"))).toBe(true);
});

it("pressing Escape with focus on text input creates a press step", async () => {
  expect(shouldTrackKeyPress("Escape", doc("input"))).toBe(true);
});

it("pressing Escape with focus on textarea creates a press step", async () => {
  expect(shouldTrackKeyPress("Escape", doc("textarea"))).toBe(true);
});

it("pressing Escape with focus on contenteditable element creates a press step", async () => {
  expect(shouldTrackKeyPress("Escape", doc("div", true))).toBe(true);
});

it("pressing a letter with focus on non-input does not create a press step", async () => {
  expect(shouldTrackKeyPress("a", doc("body"))).toBe(false);
});

it("pressing a letter with focus on text input does not create a press step", async () => {
  expect(shouldTrackKeyPress("a", doc("input"))).toBe(false);
});

it("pressing a letter with focus on textarea does not create a press step", async () => {
  expect(shouldTrackKeyPress("a", doc("textarea"))).toBe(false);
});

it("pressing a letter with focus on contenteditable element does not create a press step", async () => {
  expect(shouldTrackKeyPress("a", doc("div", true))).toBe(false);
});

it("pressing Spacebar with focus on non-input does not create a press step", async () => {
  expect(shouldTrackKeyPress(" ", doc("body"))).toBe(false);
});

it("pressing Spacebar with focus on text input does not create a press step", async () => {
  expect(shouldTrackKeyPress(" ", doc("input"))).toBe(false);
});

it("pressing Spacebar with focus on textarea does not create a press step", async () => {
  expect(shouldTrackKeyPress(" ", doc("textarea"))).toBe(false);
});

it("pressing Spacebar with focus on contenteditable element does not create a press step", async () => {
  expect(shouldTrackKeyPress(" ", doc("div", true))).toBe(false);
});

it("pressing ArrowDown with focus on non-input creates a press step", async () => {
  expect(shouldTrackKeyPress("ArrowDown", doc("body"))).toBe(true);
});

it("pressing ArrowDown with focus on text input does not create a press step", async () => {
  expect(shouldTrackKeyPress("ArrowDown", doc("input"))).toBe(false);
});

it("pressing ArrowDown with focus on textarea does not create a press step", async () => {
  expect(shouldTrackKeyPress("ArrowDown", doc("textarea"))).toBe(false);
});

it("pressing ArrowDown with focus on contenteditable element does not create a press step", async () => {
  expect(shouldTrackKeyPress("ArrowDown", doc("div", true))).toBe(false);
});

it("pressing ArrowLeft with focus on non-input creates a press step", async () => {
  expect(shouldTrackKeyPress("ArrowLeft", doc("body"))).toBe(true);
});

it("pressing ArrowLeft with focus on text input does not create a press step", async () => {
  expect(shouldTrackKeyPress("ArrowLeft", doc("input"))).toBe(false);
});

it("pressing ArrowLeft with focus on textarea does not create a press step", async () => {
  expect(shouldTrackKeyPress("ArrowLeft", doc("textarea"))).toBe(false);
});

it("pressing ArrowLeft with focus on contenteditable element does not create a press step", async () => {
  expect(shouldTrackKeyPress("ArrowLeft", doc("div", true))).toBe(false);
});

it("pressing ArrowRight with focus on non-input creates a press step", async () => {
  expect(shouldTrackKeyPress("ArrowRight", doc("body"))).toBe(true);
});

it("pressing ArrowRight with focus on text input does not create a press step", async () => {
  expect(shouldTrackKeyPress("ArrowRight", doc("input"))).toBe(false);
});

it("pressing ArrowRight with focus on textarea does not create a press step", async () => {
  expect(shouldTrackKeyPress("ArrowRight", doc("textarea"))).toBe(false);
});

it("pressing ArrowRight with focus on contenteditable element does not create a press step", async () => {
  expect(shouldTrackKeyPress("ArrowRight", doc("div", true))).toBe(false);
});

it("pressing ArrowUp with focus on non-input creates a press step", async () => {
  expect(shouldTrackKeyPress("ArrowUp", doc("body"))).toBe(true);
});

it("pressing ArrowUp with focus on text input does not create a press step", async () => {
  expect(shouldTrackKeyPress("ArrowUp", doc("input"))).toBe(false);
});

it("pressing ArrowUp with focus on textarea does not create a press step", async () => {
  expect(shouldTrackKeyPress("ArrowUp", doc("textarea"))).toBe(false);
});

it("pressing ArrowUp with focus on contenteditable element does not create a press step", async () => {
  expect(shouldTrackKeyPress("ArrowUp", doc("div", true))).toBe(false);
});

it("pressing Backspace with focus on non-input creates a press step", async () => {
  expect(shouldTrackKeyPress("Backspace", doc("body"))).toBe(true);
});

it("pressing Backspace with focus on text input does not create a press step", async () => {
  expect(shouldTrackKeyPress("Backspace", doc("input"))).toBe(false);
});

it("pressing Backspace with focus on textarea does not create a press step", async () => {
  expect(shouldTrackKeyPress("Backspace", doc("textarea"))).toBe(false);
});

it("pressing Backspace with focus on contenteditable element does not create a press step", async () => {
  expect(shouldTrackKeyPress("Backspace", doc("div", true))).toBe(false);
});

it("pressing Delete with focus on non-input creates a press step", async () => {
  expect(shouldTrackKeyPress("Delete", doc("body"))).toBe(true);
});

it("pressing Delete with focus on text input does not create a press step", async () => {
  expect(shouldTrackKeyPress("Delete", doc("input"))).toBe(false);
});

it("pressing Delete with focus on textarea does not create a press step", async () => {
  expect(shouldTrackKeyPress("Delete", doc("textarea"))).toBe(false);
});

it("pressing Delete with focus on contenteditable element does not create a press step", async () => {
  expect(shouldTrackKeyPress("Delete", doc("div", true))).toBe(false);
});
