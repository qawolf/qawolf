import Browser from "./Browser";

test("Browser launches", async () => {
  const browser = new Browser();
  await browser.launch("https://example.org");
  await browser.close();
});
