import {type YAMLMap, type Scalar, type CST} from 'yaml';
import {
  YAMLLanguage,
  type YAMLOkParseResult
} from '../../src/languages/yaml-language.js';
import {YAMLSourceCode} from '../../src/languages/yaml-source-code.js';
import {expect, describe, it, beforeEach} from 'vitest';

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
  it('should extract comments on non-documents', () => {
    const sourceCode = getSourceCodeForText(
      '# Comment 1\nfoo: bar # Comment 2\nbaz:\n  # Comment 3\n  - boop\n'
    );
    expect(sourceCode.comments).toEqual([
      {type: 'comment', indent: 2, offset: 40, source: '# Comment 3'},
      {type: 'comment', indent: 0, offset: 21, source: '# Comment 2'}
    ]);
  });

  it('should set the ast', () => {
    const sourceCode = getSourceCodeForText('foo: bar');
    expect(sourceCode.ast).toBeDefined();
  });

  describe('getInlineConfigNodes', () => {
    it('should get all the inline config nodes', () => {
      const sourceCode = getSourceCodeForText(`
foo: 303 # eslint-disable-line foo
# eslint-disable-next-line some-rule
bar: 808 # not a config node
      `);
      const inlineConfigNodes = sourceCode.getInlineConfigNodes();
      expect(inlineConfigNodes).toHaveLength(2);
      expect(inlineConfigNodes[0].source).toBe(
        '# eslint-disable-next-line some-rule'
      );
      expect(inlineConfigNodes[1].source).toBe('# eslint-disable-line foo');
    });
  });

  describe('getLoc', () => {
    let sourceCode: YAMLSourceCode;

    beforeEach(() => {
      sourceCode = getSourceCodeForText('foo: bar');
    });

    it('should return empty location for rangeless nodes', () => {
      const node = sourceCode.ast.contents!;
      node.range = undefined;
      expect(sourceCode.getLoc(node)).toEqual({
        start: {line: 0, column: 0},
        end: {line: 0, column: 0}
      });
    });

    it('should return location for a pair', () => {
      const contents = sourceCode.ast.contents as YAMLMap;
      const node = contents.items[0];
      expect(sourceCode.getLoc(node)).toEqual({
        start: {line: 1, column: 1},
        end: {line: 1, column: 9}
      });
    });

    it('should return empty location for broken pairs', () => {
      const contents = sourceCode.ast.contents as YAMLMap;
      const node = contents.items[0];
      node.key = 'oogabooga';
      expect(sourceCode.getLoc(node)).toEqual({
        start: {line: 0, column: 0},
        end: {line: 0, column: 0}
      });
    });

    it('should return location for nodes', () => {
      const contents = sourceCode.ast.contents as YAMLMap;
      const node = contents.items[0].key as Scalar;
      expect(sourceCode.getLoc(node)).toEqual({
        start: {line: 1, column: 1},
        end: {line: 1, column: 4}
      });
    });
  });

  describe('getRange', () => {
    it('should return empty range for rangeless nodes', () => {
      const sourceCode = getSourceCodeForText('foo: bar');
      const node = sourceCode.ast.contents!;
      node.range = undefined;
      expect(sourceCode.getRange(node)).toEqual([0, 0]);
    });

    it('should return range for a pair', () => {
      const sourceCode = getSourceCodeForText('foo: bar');
      const contents = sourceCode.ast.contents as YAMLMap;
      const node = contents.items[0];
      expect(sourceCode.getRange(node)).toEqual([0, 8]);
    });

    it('should return empty range for broken pairs', () => {
      const sourceCode = getSourceCodeForText('foo: bar');
      const contents = sourceCode.ast.contents as YAMLMap;
      const node = contents.items[0];
      node.key = 'oogabooga';
      expect(sourceCode.getRange(node)).toEqual([0, 0]);
    });

    it('should return range for nodes', () => {
      const sourceCode = getSourceCodeForText('foo: bar');
      const contents = sourceCode.ast.contents as YAMLMap;
      const node = contents.items[0].key as Scalar;
      expect(sourceCode.getRange(node)).toEqual([0, 3]);
    });
  });

  describe('getDisableDirectives', () => {
    it('should handle disable directives', () => {
      const sourceCode = getSourceCodeForText(`
foo: 303
# eslint-disable foo, bar -- justified
bar: 303
      `);
      const {directives, problems} = sourceCode.getDisableDirectives();

      expect(directives).toHaveLength(1);
      expect(problems.length).toBe(0);
      expect(directives[0].type).toBe('disable');
      expect((directives[0].node as CST.SourceToken).source).toBe(
        '# eslint-disable foo, bar -- justified'
      );
      expect(directives[0].value).toEqual('foo, bar');
      expect(directives[0].justification).toBe('justified');
    });

    it('should handle enable directives', () => {
      const sourceCode = getSourceCodeForText(`
foo: 303
# eslint-enable foo, bar -- justified
bar: 303
      `);
      const {directives, problems} = sourceCode.getDisableDirectives();
      expect(directives).toHaveLength(1);
      expect(problems.length).toBe(0);
      expect(directives[0].type).toBe('enable');
      expect((directives[0].node as CST.SourceToken).source).toBe(
        '# eslint-enable foo, bar -- justified'
      );
      expect(directives[0].value).toEqual('foo, bar');
    });

    it('should handle disable-next-line directives', () => {
      const sourceCode = getSourceCodeForText(`
foo: 303
# eslint-disable-next-line foo, bar -- justified
bar: 303
      `);
      const {directives, problems} = sourceCode.getDisableDirectives();
      expect(directives).toHaveLength(1);
      expect(problems.length).toBe(0);
      expect(directives[0].type).toBe('disable-next-line');
      expect((directives[0].node as CST.SourceToken).source).toBe(
        '# eslint-disable-next-line foo, bar -- justified'
      );
      expect(directives[0].value).toEqual('foo, bar');
      expect(directives[0].justification).toBe('justified');
    });

    it('should handle disable-line directives', () => {
      const sourceCode = getSourceCodeForText(
        'foo: 303 # eslint-disable-line foo, bar -- justified'
      );
      const {directives, problems} = sourceCode.getDisableDirectives();
      expect(directives).toHaveLength(1);
      expect(problems.length).toBe(0);
      expect(directives[0].type).toBe('disable-line');
      expect((directives[0].node as CST.SourceToken).source).toBe(
        '# eslint-disable-line foo, bar -- justified'
      );
      expect(directives[0].value).toEqual('foo, bar');
      expect(directives[0].justification).toBe('justified');
    });

    it('should handle directive without justification', () => {
      const sourceCode = getSourceCodeForText(
        'foo: 303 # eslint-disable-line foo, bar'
      );
      const {directives, problems} = sourceCode.getDisableDirectives();
      expect(directives).toHaveLength(1);
      expect(problems.length).toBe(0);
      expect(directives[0].type).toBe('disable-line');
      expect((directives[0].node as CST.SourceToken).source).toBe(
        '# eslint-disable-line foo, bar'
      );
      expect(directives[0].value).toEqual('foo, bar');
      expect(directives[0].justification).toBe('');
    });

    it('should handle valueless directive', () => {
      const sourceCode = getSourceCodeForText('foo: 303 # eslint-disable-line');
      const {directives, problems} = sourceCode.getDisableDirectives();
      expect(directives).toHaveLength(1);
      expect(problems.length).toBe(0);
      expect(directives[0].type).toBe('disable-line');
      expect((directives[0].node as CST.SourceToken).source).toBe(
        '# eslint-disable-line'
      );
      expect(directives[0].value).toEqual('');
      expect(directives[0].justification).toBe('');
    });
  });
});
