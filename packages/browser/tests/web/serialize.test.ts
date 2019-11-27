import { htmlToDoc } from "@qawolf/web";

describe("htmlToDoc", () => {
  it("serializes an input", () => {
    expect(
      htmlToDoc(
        '<input type="text" name="username" id="username" autocomplete="off" >'
      )
    ).toEqual({
      attrs: {
        autocomplete: "off",
        id: "username",
        name: "username",
        type: "text"
      },
      children: [],
      name: "input",
      type: "tag",
      voidElement: true
    });
  });

  it("serializes an element with content", () => {
    expect(htmlToDoc('<h2 contentEditable="true">Login Page</h2>')).toEqual({
      attrs: {
        contentEditable: "true"
      },
      children: [
        {
          content: "Login Page",
          type: "text"
        }
      ],
      name: "h2",
      type: "tag",
      voidElement: false
    });
  });
});

// it("includes src and alt in image descriptor", async () => {
//   await browser.goto(`${CONFIG.testUrl}broken_images`);

//   const imgDescriptor = await page.evaluate(() => {
//     const qawolf: QAWolfWeb = (window as any).qawolf;

//     const images = document.getElementsByTagName("img");
//     images[3].alt = "Alt text";

//     const result = qawolf.element.getDescriptor(
//       document.getElementsByTagName("img")[3],
//       "data-qa"
//     );

//     return result;
//   });

//   expect(imgDescriptor).toMatchObject({
//     alt: "Alt text",
//     tagName: "img"
//   });
//   // hostname differs depending on where tests are run
//   expect(imgDescriptor.src).toMatch("img/avatar-blank.jpg");

//   await browser.goto(`${CONFIG.testUrl}login`);
// });

// it("includes src and alt of child image if applicable", async () => {
//   await browser.goto(`${CONFIG.testUrl}broken_images`);

//   const imgDescriptor = await page.evaluate(() => {
//     const qawolf: QAWolfWeb = (window as any).qawolf;

//     const images = document.getElementsByTagName("img");
//     images[1].alt = "Alt text";

//     const result = qawolf.element.getDescriptor(
//       document.querySelector(".example") as HTMLElement,
//       "data-qa"
//     );

//     return result;
//   });

//   expect(imgDescriptor).toMatchObject({
//     alt: "Alt text",
//     tagName: "div"
//   });
//   // hostname differs depending on where tests are run
//   expect(imgDescriptor.src).toMatch("asdf.jpg");

//   await browser.goto(`${CONFIG.testUrl}login`);
// });

// describe("getIconContent", () => {
// it("returns icon content on i tag", async () => {
//   const iconContent = await page.evaluate(() => {
//     const qawolf: QAWolfWeb = (window as any).qawolf;

//     return qawolf.element.getIconContent(
//       document.getElementsByTagName("i")[0]
//     );
//   });

//   expect(iconContent).toEqual(["fa", "fa-2x", "fa-sign-in"]);
// });

// it("returns child icon content", async () => {
//   const iconContent = await page.evaluate(() => {
//     const qawolf: QAWolfWeb = (window as any).qawolf;

//     return qawolf.element.getIconContent(
//       document.getElementsByTagName("button")[0]
//     );
//   });

//   expect(iconContent).toEqual(["fa", "fa-2x", "fa-sign-in"]);
// });

// it("returns null if no icon content", async () => {
//   const iconContent = await page.evaluate(() => {
//     const qawolf: QAWolfWeb = (window as any).qawolf;

//     return qawolf.element.getIconContent(
//       document.getElementsByTagName("input")[0]
//     );
//   });

//   expect(iconContent).toBeNull();
// });
// });

// describe("getLabels", () => {
// it("correctly returns labels", async () => {
//   const nullLabels = await page.evaluate(() => {
//     const qawolf: QAWolfWeb = (window as any).qawolf;

//     return qawolf.element.getLabels(document.getElementsByTagName("h2")[0]);
//   });

//   expect(nullLabels).toBeNull();

//   const usernameLabels = await page.evaluate(() => {
//     const qawolf: QAWolfWeb = (window as any).qawolf;

//     return qawolf.element.getLabels(
//       document.getElementsByTagName("input")[0]
//     );
//   });

//   expect(usernameLabels).toEqual(["username"]);
// });
// });

// describe("getParentText", () => {
// it("correctly returns parent text", async () => {
//   const iconParentText = await page.evaluate(() => {
//     const qawolf: QAWolfWeb = (window as any).qawolf;

//     return qawolf.element.getParentText(
//       document.getElementsByTagName("i")[0]
//     );
//   });

//   expect(iconParentText).toEqual(["login", "login"]);
// });
// });

// it("returns placeholder if present", async () => {
//   const placeholder = await page.evaluate(() => {
//     const qawolf: QAWolfWeb = (window as any).qawolf;
//     const input = document.getElementsByTagName("input")[0];
//     input.placeholder = "enter username";

//     const result = qawolf.element.getPlaceholder(
//       document.getElementsByTagName("input")[0]
//     );

//     input.removeAttribute("placeholder");

//     return result;
//   });

//   expect(placeholder).toBe("enter username");
// });

// it("returns disabled option text for select", async () => {
//   await page.goto(`${CONFIG.testUrl}dropdown`);

//   const placeholder = await page.evaluate(() => {
//     const qawolf: QAWolfWeb = (window as any).qawolf;

//     return qawolf.element.getPlaceholder(
//       document.getElementsByTagName("select")[0]
//     );
//   });

//   expect(placeholder).toBe("please select an option");

//   await page.goto(`${CONFIG.testUrl}login`);
// });

// it("returns text content", async () => {
//   const headerTextContent = await page.evaluate(() => {
//     const qawolf: QAWolfWeb = (window as any).qawolf;

//     return qawolf.element.getTextContent(
//       document.getElementsByTagName("h2")[0]
//     );
//   });

//   expect(headerTextContent).toBe("login page");

//   const nullTextContent = await page.evaluate(() => {
//     const qawolf: QAWolfWeb = (window as any).qawolf;

//     return qawolf.element.getTextContent(
//       document.getElementsByTagName("input")[0]
//     );
//   });

//   expect(nullTextContent).toBeNull();
// });
