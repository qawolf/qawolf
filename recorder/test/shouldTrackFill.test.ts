import { shouldTrackFill } from "../src/shouldTrackFill";
import { Doc } from "../src/types";

function doc(name: string, isContentEditable = false, type?: string): Doc {
  return {
    name,
    attrs: {
      contenteditable: isContentEditable ? "true" : undefined,
      type,
    },
  };
}

it("typing in a textarea creates a fill step", async () => {
  expect(shouldTrackFill(doc("textarea"))).toBe(true);
});

it("typing in a contenteditable creates a fill step", async () => {
  expect(shouldTrackFill(doc("div", true))).toBe(true);
});

it("typing in a text input creates a fill step", async () => {
  expect(shouldTrackFill(doc("input", false, "text"))).toBe(true);
});

it("typing in a search input creates a fill step", async () => {
  expect(shouldTrackFill(doc("input", false, "search"))).toBe(true);
});

it("typing in a browser date input creates a fill step", async () => {
  expect(shouldTrackFill(doc("input", false, "date"))).toBe(true);
});

it("typing in a browser datetime-local input creates a fill step", async () => {
  expect(shouldTrackFill(doc("input", false, "datetime-local"))).toBe(true);
});

it("typing in a browser time input creates a fill step", async () => {
  expect(shouldTrackFill(doc("input", false, "time"))).toBe(true);
});

it("typing in a browser week input creates a fill step", async () => {
  expect(shouldTrackFill(doc("input", false, "week"))).toBe(true);
});

it("typing in a browser month input creates a fill step", async () => {
  expect(shouldTrackFill(doc("input", false, "month"))).toBe(true);
});

it("typing in a browser number input creates a fill step", async () => {
  expect(shouldTrackFill(doc("input", false, "number"))).toBe(true);
});

it("typing in a browser email input creates a fill step", async () => {
  expect(shouldTrackFill(doc("input", false, "email"))).toBe(true);
});

it("typing in a browser password input creates a fill step", async () => {
  expect(shouldTrackFill(doc("input", false, "password"))).toBe(true);
});

it("typing in a browser phone number input creates a fill step", async () => {
  expect(shouldTrackFill(doc("input", false, "tel"))).toBe(true);
});

it("typing in a browser url input creates a fill step", async () => {
  expect(shouldTrackFill(doc("input", false, "url"))).toBe(true);
});

it("picking a color from a browser color input creates a fill step", async () => {
  expect(shouldTrackFill(doc("input", false, "color"))).toBe(true);
});

it("picking a number on a browser range input creates a fill step", async () => {
  expect(shouldTrackFill(doc("input", false, "range"))).toBe(true);
});

it("clicking a checkbox does not create a fill step", async () => {
  expect(shouldTrackFill(doc("input", false, "checkbox"))).toBe(false);
});

it("clicking a radio button does not create a fill step", async () => {
  expect(shouldTrackFill(doc("input", false, "radio"))).toBe(false);
});
