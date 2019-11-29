import {
  compareAttributes,
  compareContent,
  compareDoc,
  htmlToDoc,
  matchTarget
} from "@qawolf/web";

const doc = htmlToDoc;

const selector = (html: string) => ({ node: doc(html), ancestors: [] });

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

describe("matchTarget", () => {
  describe("strong keys", () => {
    it("matches alt", () => {
      expect(
        matchTarget(
          selector('<img alt="a grapefruit">'),
          selector('<img alt="a grapefruit">')
        ).strongKeys
      ).toEqual(["alt"]);
    });

    it("matches content", () => {
      expect(
        matchTarget(
          selector("<a>grapefruit</a>"),
          selector("<a>grapefruit</a>")
        ).strongKeys
      ).toEqual(["children[0].content"]);
    });

    it("matches id", () => {
      expect(
        matchTarget(
          selector('<img alt="a grapefruit">'),
          selector('<img alt="a grapefruit">')
        ).strongKeys
      ).toEqual(["alt"]);
    });

    it("matches name", () => {
      expect(
        matchTarget(
          selector('<img name="grapefruit">'),
          selector('<img name="grapefruit">')
        ).strongKeys
      ).toEqual(["name"]);
    });

    it("matches placeholder", () => {
      expect(
        matchTarget(
          selector('<input placeholder="qawolf">'),
          selector('<input placeholder="qawolf">')
        ).strongKeys
      ).toEqual(["placeholder"]);
    });

    it("matches src", () => {
      expect(
        matchTarget(
          selector('<img src="https://cdn.com/Grapefruit.jpg">'),
          selector('<img src="https://cdn.com/Grapefruit.jpg">')
        ).strongKeys
      ).toEqual(["src"]);
    });

    it("matches title", () => {
      expect(
        matchTarget(
          selector('<img title="a grapefruit">'),
          selector('<img title="a grapefruit">')
        ).strongKeys
      ).toEqual(["title"]);
    });
  });
});
