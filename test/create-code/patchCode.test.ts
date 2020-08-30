import {
  canPatch,
  patchCode,
  PATCH_HANDLE,
  removePatchHandle,
} from '../../src/create-code/patchCode';

describe('canPatch', () => {
  it('returns true when the create symbol is found', () => {
    expect(canPatch(`someCode();\n${PATCH_HANDLE}`)).toBe(true);
  });

  it('returns false when the create symbol is missing', () => {
    expect(canPatch('')).toBe(false);
  });
});

describe('patchCode', () => {
  it('matches indentation', () => {
    const patched = patchCode({
      code: `  myMethod();\n  ${PATCH_HANDLE}`,
      patchLines: ['myPatch();'],
      replaceLines: [],
    });
    expect(patched).toEqual(`  myMethod();\n  myPatch();\n  ${PATCH_HANDLE}`);
  });

  it('replaces lines', () => {
    const patched = patchCode({
      code: `  myMethod();\n  ${PATCH_HANDLE}`,
      patchLines: ['myPatch();'],
      replaceLines: ['myMethod();'],
    });
    expect(patched).toEqual(`  myPatch();\n  ${PATCH_HANDLE}`);
  });
});

describe('removePatchHandle', () => {
  it('removes the line with the patch symbol', () => {
    const patched = removePatchHandle(
      `myMethod();\n${PATCH_HANDLE}\nmySecondMethod();`,
    );
    expect(patched).toEqual('myMethod();\nmySecondMethod();');
  });
});
