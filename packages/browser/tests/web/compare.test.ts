import {
  compareAttributes,
  compareContent,
  compareDoc,
  countComparison,
  htmlToDoc
} from "@qawolf/web";

const doc = htmlToDoc;

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
      "children[0]": {
        "children[0]": {
          content: true,
          name: true
        },
        name: true
      },
      "children[1]": {
        "children[0]": {
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

describe("countComparison", () => {
  it("counts children keys", () => {
    const comparison = compareDoc(
      doc(
        "<a><p class='small bold'>Hello</p><p class='small bold'>Sup</p></a>"
      ),
      doc("<a><p class='small bold'>Hello</p><p class='small bold'>Sup</p></a>")
    );

    expect(countComparison(comparison)).toEqual({
      matches: [
        "children[0].class.small",
        "children[0].class.bold",
        "children[0].children[0].content",
        "children[0].children[0].name",
        "children[0].name",
        "children[1].class.small",
        "children[1].class.bold",
        "children[1].children[0].content",
        "children[1].children[0].name",
        "children[1].name",
        "name"
      ],
      total: 11
    });
  });
});
