describe("nodeEnvironment", () => {
  it("creates node environment if workflow file not available", () => {
    expect((global as any).runner).toBeFalsy();
    expect((global as any).beforeEach).toBeTruthy();
  });
});
