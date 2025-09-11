import {
  YAMLLanguage,
  type YAMLOkParseResult
} from '../../src/languages/yaml-language.js';
import {YAMLSourceCode} from '../../src/languages/yaml-source-code.js';
import {expect, describe, it} from 'vitest';

function getSourceCodeForText(text: string): YAMLSourceCode {
  const language = new YAMLLanguage();
  const file = {
    body: text,
    path: 'test.yaml',
    physicalPath: '/test.yaml',
    bom: false
  };
  const parseResult = language.parse(file, {
    languageOptions: {}
  }) as YAMLOkParseResult;
  return language.createSourceCode(file, parseResult);
}

describe('YAMLSourceCode', () => {
  it('should extract comments', () => {
    const sourceCode = getSourceCodeForText(
      '# Comment 1\nfoo: bar # Comment 2\nbaz:\n  # Comment 3\n  - boop\n'
    );
    expect(sourceCode.comments).toEqual([
      {type: 'comment', indent: 0, offset: 0, source: '# Comment 1'},
      {type: 'comment', indent: 2, offset: 40, source: '# Comment 3'},
      {type: 'comment', indent: 0, offset: 21, source: '# Comment 2'}
    ]);
  });
});
