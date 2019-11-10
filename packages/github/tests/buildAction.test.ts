import { buildAction } from "../src/buildAction";

describe("buildAction", () => {
  it("returns action template", () => {
    const action = buildAction();

    expect(action).toMatchSnapshot();
  });
});
