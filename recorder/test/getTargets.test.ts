// TODO...

// describe("getTargets", () => {
//   beforeAll(() => page.goto(`${TEST_URL}buttons`));

//   it("returns a clickable group", async () => {
//     const group = await page.evaluate(() => {
//       const web: QAWolfWeb = (window as any).qawolf;
//       const element = document.querySelector("#nested span") as HTMLElement;
//       if (!element) throw new Error("element not found");

//       return web.getTargets(element).map((el) => el.tagName);
//     });

//     expect(group).toMatchInlineSnapshot(`
//       Array [
//         "BUTTON",
//         "DIV",
//         "SPAN",
//       ]
//     `);
//   });

//   it("group has all elements when target is the topmost element in group", async () => {
//     const group = await page.evaluate(() => {
//       const web: QAWolfWeb = (window as any).qawolf;
//       const element = document.querySelector("#nested") as HTMLElement;
//       if (!element) throw new Error("element not found");

//       return web.getTargets(element).map((el) => el.tagName);
//     });

//     expect(group).toMatchInlineSnapshot(`
//       Array [
//         "BUTTON",
//         "DIV",
//         "SPAN",
//       ]
//     `);
//   });

//   it("group has sibling elements and does not have svg descendants", async () => {
//     const group = await page.evaluate(() => {
//       const web: QAWolfWeb = (window as any).qawolf;
//       const element = document.querySelector(
//         '[data-for-test="nested-svg"] > svg > circle'
//       ) as HTMLElement;
//       if (!element) throw new Error("element not found");

//       return web.getTargets(element).map((el) => el.tagName);
//     });

//     expect(group).toMatchInlineSnapshot(`
//       Array [
//         "BUTTON",
//         "svg",
//         "DIV",
//         "SPAN",
//       ]
//     `);
//   });

//   it("group omits nested button groups", async () => {
//     const group = await page.evaluate(() => {
//       const web: QAWolfWeb = (window as any).qawolf;
//       const element = document.querySelector(
//         '[data-for-test="nested-svg-with-nested-link"]'
//       ) as HTMLElement;
//       if (!element) throw new Error("element not found");

//       return web.getTargets(element).map((el) => el.tagName);
//     });

//     expect(group).toMatchInlineSnapshot(`
//       Array [
//         "BUTTON",
//         "svg",
//         "DIV",
//         "SPAN",
//       ]
//     `);
//   });

//   it("works on a nested button group", async () => {
//     const group = await page.evaluate(() => {
//       const web: QAWolfWeb = (window as any).qawolf;
//       const element = document.querySelector(
//         '[data-for-test="nested-svg-with-nested-link"] > a > span'
//       ) as HTMLElement;
//       if (!element) throw new Error("element not found");

//       return web.getTargets(element).map((el) => el.tagName);
//     });

//     expect(group).toMatchInlineSnapshot(`
//       Array [
//         "A",
//         "SPAN",
//       ]
//     `);
//   });

//   it("returns empty array if the element is not clickable", async () => {
//     const groupLength = await page.evaluate(() => {
//       const web: QAWolfWeb = (window as any).qawolf;
//       const element = document.querySelector("h3") as HTMLElement;
//       if (!element) throw new Error("element not found");

//       return web.getTargets(element).length;
//     });

//     expect(groupLength).toBe(0);
//   });
// });
