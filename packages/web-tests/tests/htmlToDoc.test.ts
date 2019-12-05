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
