// export const input = async (elementHandle: ElementHandle): Promise<void> => {
//   const handleProperty = await elementHandle.getProperty("tagName");
//   const tagName = await handleProperty.jsonValue();
//   const value = step.value || "";

//   if (tagName.toLowerCase() === "select") {
//     await elementHandle.select(value);
//   } else {
//     // clear current value
//     await elementHandle.evaluate(element => {
//       element.value = "";
//     });

//     await elementHandle.type(value);
//   }
// };

// export const scroll = async (page: Page, step: BrowserStep): Promise<void> => {
//   await page.evaluate(
//     step => {
//       const qawolf: QAWolf = (window as any).qawolf;
//       return qawolf.actions.scrollTo(step.scrollTo!);
//     },
//     step as Serializable
//   );
// };
