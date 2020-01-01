import {
  compareAttributes,
  compareContent,
  compareDoc,
  htmlToDoc,
  matchDocSelector
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

  it("ignores attrs.innertext newlines, whitespace, extra spaces", () => {
    expect(
      compareAttributes(
        doc('<a innertext=" Hello world  "> Hello world  </a>').attrs,
        doc('<a innertext="hello World">hello World</a>').attrs
      )
    ).toEqual({
      attrs: {
        innertext: true
      },
      matches: ["innertext"],
      total: 1
    });
  });

  it("ignores dynamic attributes", () => {
    expect(
      compareAttributes(
        doc('<a data-reactid="123" innertext="hello">hello</a>').attrs,
        doc('<a data-reactid="345" innertext="hello">hello</a>').attrs
      )
    ).toEqual({
      attrs: {
        innertext: true
      },
      matches: ["innertext"],
      total: 1
    });
  });
});

describe("compareContent", () => {
  it("ignores newlines, whitespace, extra spaces", () => {
    expect(
      compareContent(
        doc("<a>\ngit is great   </a>").children![0].content,
        doc("<a>git is   great</a>").children![0].content
      )
    ).toEqual(true);

    expect(
      compareContent(
        doc("<a>git is great</a>").children![0].content,
        doc("<a>gitter is great</a>").children![0].content
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

describe("matchDocSelector", () => {
  describe("strong keys", () => {
    it("matches alt", () => {
      expect(
        matchDocSelector(
          selector('<img alt="a grapefruit">'),
          selector('<img alt="a grapefruit">')
        ).strongKeys
      ).toEqual(["alt"]);
    });

    it("matches data attribute", () => {
      expect(
        matchDocSelector(
          selector('<img data-qa="apple">'),
          selector('<button data-qa="apple"></button>'),
          "data-qa"
        ).strongKeys
      ).toEqual(["data-qa"]);
    });

    it("matches id", () => {
      expect(
        matchDocSelector(
          selector('<img alt="a grapefruit">'),
          selector('<img alt="a grapefruit">')
        ).strongKeys
      ).toEqual(["alt"]);
    });

    it("matches innertext", () => {
      expect(
        matchDocSelector(
          selector('<a innertext=" Hello world  "> Hello world  </a>'),
          selector('<a innertext="hello World">hello World</a>')
        ).strongKeys
      ).toEqual(["innertext"]);
    });

    it("matches labels", () => {
      expect(
        matchDocSelector(
          selector('<a labels="hey SUP yo" />'),
          selector('<a labels="yo sup" />')
        ).strongKeys
      ).toEqual(["labels.yo"]);
    });

    it("matches name", () => {
      expect(
        matchDocSelector(
          selector('<img name="grapefruit">'),
          selector('<img name="grapefruit">')
        ).strongKeys
      ).toEqual(["name"]);
    });

    it("matches placeholder", () => {
      expect(
        matchDocSelector(
          selector('<input placeholder="qawolf">'),
          selector('<input placeholder="qawolf">')
        ).strongKeys
      ).toEqual(["placeholder"]);
    });

    it("matches src", () => {
      expect(
        matchDocSelector(
          selector('<img src="https://cdn.com/Grapefruit.jpg">'),
          selector('<img src="https://cdn.com/Grapefruit.jpg">')
        ).strongKeys
      ).toEqual(["src"]);
    });

    it("matches title", () => {
      expect(
        matchDocSelector(
          selector('<img title="a grapefruit">'),
          selector('<img title="a grapefruit">')
        ).strongKeys
      ).toEqual(["title"]);
    });
  });
});
