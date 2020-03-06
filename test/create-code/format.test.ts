import {
  getIndentation,
  indent,
  removeLinesIncluding,
} from '../../src/create-code/format';

describe('getIndentation', () => {
  it('works for no lines', () => {
    expect(getIndentation('', 'mySearch')).toEqual(0);
  });

  it('works for one line', () => {
    const indentation = getIndentation('   mySearch', 'mySearch');
    expect(indentation).toEqual(3);
  });

  it('works for multi-line', () => {
    const indentation = getIndentation(
      'a bunch of stuff here\n\n    mySearch',
      'mySearch',
    );

    expect(indentation).toEqual(4);
  });
});

describe('indent', () => {
  it('works for one line', () => {
    const indentation = indent('mySearch', 3);
    expect(indentation).toEqual('   mySearch');
  });

  it('works for multi-line', () => {
    const indentation = indent('1\n2\n3abc  de ', 2);
    expect(indentation).toEqual('  1\n  2\n  3abc  de ');
  });
});

describe('removeLinesIncluding', () => {
  it('removes lines including text', () => {
    expect(removeLinesIncluding('\n1\n   my text  \n2', 'my text')).toEqual(
      '\n1\n2',
    );
  });
});
