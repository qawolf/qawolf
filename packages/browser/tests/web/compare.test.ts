import {
  compareAttributes,
  compareContent,
  compareDoc,
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
      attrs: {
        href: true,
        target: false
      },
      matches: ["href"],
      total: 2
    });
  });

  it("compares classes individually", () => {
    expect(
      compareAttributes(
        doc("<a class='small bold'></a>").attrs,
        doc("<a class='italics small'></a>").attrs
      )
    ).toEqual({
      attrs: {
        "class.bold": false,
        "class.small": true
      },
      matches: ["class.small"],
      total: 2
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
      attrs: {},
      children: [
        {
          attrs: {},
          children: [
            {
              attrs: {},
              children: [],
              content: true,
              matches: ["tag", "content"],
              name: true,
              total: 2
            }
          ],
          matches: ["tag", "children[0].tag", "children[0].content"],
          name: true,
          total: 3
        },
        {
          attrs: {
            "class.bold": false,
            "class.small": false
          },
          children: [
            {
              attrs: {},
              children: [],
              content: false,
              matches: [],
              name: false,
              total: 2
            }
          ],
          matches: [],
          name: false,
          total: 5
        }
      ],
      matches: [
        "tag",
        "children[0].tag",
        "children[0].children[0].tag",
        "children[0].children[0].content"
      ],
      name: true,
      total: 9
    });
  });

  it("compares the tag", () => {
    expect(compareDoc(doc("<a></a>"), doc("<a></a>"))).toEqual({
      attrs: {},
      children: [],
      matches: ["tag"],
      name: true,
      total: 1
    });

    expect(compareDoc(doc("<a></a>"), doc("<p></p>"))).toEqual({
      attrs: {},
      children: [],
      matches: [],
      name: false,
      total: 1
    });
  });

  it("compares the name separately from the tag", () => {
    expect(
      compareDoc(doc('<a name="hello"></a>'), doc('<a name="hello"></a>'))
    ).toEqual({
      attrs: {
        name: true
      },
      children: [],
      matches: ["name", "tag"],
      name: true,
      total: 2
    });

    expect(
      compareDoc(doc('<a name="hello"></a>'), doc('<a name="goodbye"></p>'))
    ).toEqual({
      attrs: {
        name: false
      },
      children: [],
      matches: ["tag"],
      name: true,
      total: 2
    });
  });
});
