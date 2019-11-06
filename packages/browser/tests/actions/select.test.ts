// import { CONFIG } from "@qawolf/config";
// import { Browser } from "../../src/Browser";
// import { select } from "../../src/actions";

// describe("select", () => {
//   it("selects option", async () => {
//     const browser = await Browser.create({
//       url: `${CONFIG.testUrl}dropdown`
//     });
//     const page = await browser.currentPage();

//     const selectValue = await page.evaluate(() => {
//       const select = document.getElementsByTagName("select")[0];
//       return select.value;
//     });
//     expect(selectValue).toBeFalsy();

//     const element = await browser.element({
//       action: "type",
//       index: 0,
//       target: { id: "dropdown", tagName: "select" }
//     });
//     await input(element, "2");

//     const selectValue2 = await page.evaluate(() => {
//       const select = document.getElementsByTagName("select")[0];
//       return select.value;
//     });

//     expect(selectValue2).toBe("2");

//     await browser.close();
//   });
// });
