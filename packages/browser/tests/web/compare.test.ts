import {
  compareAttributes,
  compareContent,
  compareDoc,
  parseHtml
} from "@qawolf/web";

const doc = parseHtml;

describe("compareAttributes", () => {
  it("compares attributes", () => {
    expect(
      compareAttributes(
        doc("<a href='https://google.com' target='_blank'></a>").attrs,
        doc("<a href='https://google.com' target='_parent'></a>").attrs
      )
    ).toEqual({
      href: true,
      target: false
    });
  });

  it("compares classes individually", () => {
    expect(
      compareAttributes(
        doc("<a class='small bold'></a>").attrs,
        doc("<a class='small italics'></a>").attrs
      )
    ).toEqual({
      "class.small": true,
      "class.bold": false
    });
  });
});

describe("compareContent", () => {
  it("ignores newlines, whitespace, extra spaces", () => {
    expect(
      compareContent(
        doc("<a>\ngit is great   </a>").children[0].content,
        doc("<a>git is   great</a>").children[0].content
      )
    ).toEqual(true);

    expect(
      compareContent(
        doc("<a>git is great</a>").children[0].content,
        doc("<a>gitter is great</a>").children[0].content
      )
    ).toEqual(false);
  });
});

describe("compareDoc", () => {
  it("compares the children", () => {
    expect(
      compareDoc(
        doc("<a><p>Hello</p><p class='small bold'>Sup</p></a>"),
        doc("<a><p>Hello</p></a>")
      )
    ).toEqual({
      "child[0]": {
        "child[0]": {
          content: true,
          name: true
        },
        name: true
      },
      "child[1]": {
        "child[0]": {
          content: false,
          name: false
        },
        "class.bold": false,
        "class.small": false,
        name: false
      },
      name: true
    });
  });

  it("compares the tag", () => {
    expect(compareDoc(doc("<a></a>"), doc("<a></a>"))).toEqual({
      name: true
    });

    expect(compareDoc(doc("<a></a>"), doc("<p></p>"))).toEqual({
      name: false
    });
  });
});
