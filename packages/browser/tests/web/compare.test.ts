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
          tag: true
        },
        tag: true
      },
      "children[1]": {
        "children[0]": {
          content: false,
          tag: false
        },
        "class.bold": false,
        "class.small": false,
        tag: false
      },
      tag: true
    });
  });

  it("compares the tag", () => {
    expect(compareDoc(doc("<a></a>"), doc("<a></a>"))).toEqual({
      tag: true
    });

    expect(compareDoc(doc("<a></a>"), doc("<p></p>"))).toEqual({
      tag: false
    });
  });

  it("compares the name separately from the tag", () => {
    expect(
      compareDoc(doc('<a name="hello"></a>'), doc('<a name="hello"></a>'))
    ).toEqual({
      name: true,
      tag: true
    });

    expect(
      compareDoc(doc('<a name="hello"></a>'), doc('<a name="goodbye"></p>'))
    ).toEqual({
      name: false,
      tag: true
    });
  });
});

describe("countComparison", () => {
  it("counts children keys", () => {
    const comparison = compareDoc(
      doc(
        "<a><p class='small bold' name='hello'>Hello</p><p class='small bold'>Sup</p></a>"
      ),
      doc(
        "<a><p class='small bold' name='hello'>Hello</p><p class='small bold'>Sup</p></a>"
      )
    );

    expect(countComparison(comparison)).toEqual({
      matches: [
        "children[0].class.small",
        "children[0].class.bold",
        "children[0].name",
        "children[0].children[0].content",
        "children[0].children[0].tag",
        "children[0].tag",
        "children[1].class.small",
        "children[1].class.bold",
        "children[1].children[0].content",
        "children[1].children[0].tag",
        "children[1].tag",
        "tag"
      ],
      total: 12
    });
  });
});
