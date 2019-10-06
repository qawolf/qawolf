import { $xText } from "../browser/Browser";
import { CONFIG } from "../config";
import { createRunTest } from "./createRunTest";
import { loginJob } from "../fixtures/loginJob";

test("login test works", async () => {
  const { browser, success } = await createRunTest({
    ...loginJob,
    url: CONFIG.testUrl
  });
  expect(success).toBeTruthy();

  const page = (await browser.pages())[0];
  const text = await $xText(page, '//*[@id="content"]/div/h2');
  expect(text).toEqual(" Secure Area");

  await browser.close();
}, 10000);
