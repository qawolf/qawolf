describe('failure', () => {
  it('step 1', () => {});

  it('step 2', () => {});

  it('step 3', () => {
    throw new Error('demogorgon!');
  });

  it('step 4', () => {});
});
