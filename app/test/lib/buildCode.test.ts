import { buildCode } from "../../components/Editor/Sidebar/Snippet/helpers";

it("assertElement", () => {
  expect(buildCode("Assert element", ".selector", "text")).toBe(
    "await assertElement(page, \".selector\");"
  )
});

it("assertText - element", () => {
  expect(buildCode("Assert element text", ".selector", "text")).toBe(
    "await assertText(page, \"text\", { selector: \".selector\" });"
  )
});

it("assertText - page", () => {
  expect(buildCode("Assert page text", ".selector", "text")).toBe(
    "await assertText(page, \"text\");"
  )
});

it("click", () => {
  expect(buildCode("Click", ".selector", "text")).toBe(
    "await page.click(\".selector\");"
  )
});

it("fill", () => {
  expect(buildCode("Fill", ".selector", "text")).toBe(
    "await page.fill(\".selector\", \"text\");"
  )
});

it("fill test email", () => {
  expect(buildCode("Fill test email", ".selector", "text")).toBe(
    `const { email, waitForMessage } = getInbox();
await page.fill(".selector", email);
// send the email then wait for the message
// const message = await waitForMessage();`
  )
});

it("get element value", () => {
  expect(buildCode("Get element value", ".selector", "text")).toBe(
    "var value = await getValue(page, \".selector\");"
  )
});

it("hover", () => {
  expect(buildCode("Hover", ".selector", "text")).toBe(
    "await page.hover(\".selector\");"
  )
});

it("upload image", () => {
  expect(buildCode("Upload image", ".selector", "text")).toBe(
    `page.once('filechooser', (chooser) => chooser.setFiles('/root/files/avatar.png'));
await page.click(".selector");`
  )
});

it("alternative variable", () => {
  expect(buildCode("Click", ".selector", "text", "page2")).toBe(
    "await page2.click(\".selector\");"
  )
});
