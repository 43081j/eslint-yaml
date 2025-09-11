import {type YAMLMap, type YAMLSeq, Scalar, type Pair, type CST} from 'yaml';
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

  it('should set the ast', () => {
    const sourceCode = getSourceCodeForText('foo: bar');
    expect(sourceCode.ast).toBeDefined();
  });

  describe('getInlineConfigNodes', () => {
    it('should get all the inline config nodes', () => {
      const sourceCode = getSourceCodeForText(`
# eslint someRule: "foo"
foo: 303 # eslint-disable-line foo
# eslint-disable-next-line some-rule
bar: 808 # not a config node
      `);
      const inlineConfigNodes = sourceCode.getInlineConfigNodes();
      expect(inlineConfigNodes).toHaveLength(3);
      expect(inlineConfigNodes[0].source).toBe('# eslint someRule: "foo"');
      expect(inlineConfigNodes[1].source).toBe(
        '# eslint-disable-next-line some-rule'
      );
      expect(inlineConfigNodes[2].source).toBe('# eslint-disable-line foo');
    });
  });

  describe('getLoc', () => {
    let sourceCode: YAMLSourceCode;

    beforeEach(() => {
      sourceCode = getSourceCodeForText('foo: bar');
    });

    it('should return empty location for rangeless nodes', () => {
      const node = sourceCode.ast.contents[0];
      node.range = undefined;
      expect(sourceCode.getLoc(node)).toEqual({
        start: {line: 0, column: 0},
        end: {line: 0, column: 0}
      });
    });

    it('should return location for a pair', () => {
      const contents = sourceCode.ast.contents[0].contents as YAMLMap;
      const node = contents.items[0];
      expect(sourceCode.getLoc(node)).toEqual({
        start: {line: 1, column: 1},
        end: {line: 1, column: 9}
      });
    });

    it('should return empty location for broken pairs', () => {
      const contents = sourceCode.ast.contents[0].contents as YAMLMap;
      const node = contents.items[0];
      node.key = 'oogabooga';
      expect(sourceCode.getLoc(node)).toEqual({
        start: {line: 0, column: 0},
        end: {line: 0, column: 0}
      });
    });

    it('should return location for nodes', () => {
      const contents = sourceCode.ast.contents[0].contents as YAMLMap;
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
      const node = sourceCode.ast.contents[0];
      node.range = undefined;
      expect(sourceCode.getRange(node)).toEqual([0, 0]);
    });

    it('should return range for a pair', () => {
      const sourceCode = getSourceCodeForText('foo: bar');
      const contents = sourceCode.ast.contents[0].contents as YAMLMap;
      const node = contents.items[0];
      expect(sourceCode.getRange(node)).toEqual([0, 8]);
    });

    it('should return empty range for broken pairs', () => {
      const sourceCode = getSourceCodeForText('foo: bar');
      const contents = sourceCode.ast.contents[0].contents as YAMLMap;
      const node = contents.items[0];
      node.key = 'oogabooga';
      expect(sourceCode.getRange(node)).toEqual([0, 0]);
    });

    it('should return range for nodes', () => {
      const sourceCode = getSourceCodeForText('foo: bar');
      const contents = sourceCode.ast.contents[0].contents as YAMLMap;
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

  describe('applyInlineConfig', () => {
    it('should handle inline config', () => {
      const sourceCode = getSourceCodeForText(`
foo: 303
# eslint someRule: "foo", anotherRule: "bar"
bar: 808
      `);
      const {configs, problems} = sourceCode.applyInlineConfig();
      expect(problems).toHaveLength(0);
      expect(configs).toHaveLength(1);
      expect(configs[0]).toEqual({
        config: {
          rules: {
            someRule: 'foo',
            anotherRule: 'bar'
          }
        },
        loc: {
          start: {line: 3, column: 1},
          end: {line: 3, column: 45}
        }
      });
    });

    it('should return problems', () => {
      const sourceCode = getSourceCodeForText(`
foo: 303
# eslint oogabooga: !
bar: 808
      `);
      const {configs, problems} = sourceCode.applyInlineConfig();
      expect(configs).toHaveLength(0);
      expect(problems).toHaveLength(1);

      const [problem] = problems;

      expect(problem.loc).toEqual({
        start: {line: 3, column: 1},
        end: {line: 3, column: 22}
      });
      expect(problem.ruleId).toBe(null);
      expect(problem.message).toContain('Unexpected token');
    });
  });

  describe('getParent', () => {
    it('should retrieve parent nodes', () => {
      const sourceCode = getSourceCodeForText(`
foo:
- bar:
    baz: boop
      `);

      const fooMap = sourceCode.ast.contents[0].contents as YAMLMap;
      const fooPair = fooMap.items[0] as Pair<Scalar, YAMLSeq>;
      const seq = fooPair.value as YAMLSeq<YAMLMap>;
      const barMap = seq.items[0] as YAMLMap<Scalar, YAMLMap>;
      const barPair = barMap.items[0] as Pair<Scalar, YAMLMap>;
      const bazMap = barPair.value as YAMLMap<Scalar, Scalar>;
      const bazPair = bazMap.items[0] as Pair<Scalar, Scalar>;

      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      [...sourceCode.traverse()];

      // `baz:`
      expect(sourceCode.getParent(bazPair.key)).toBe(bazPair);
      // `boop`
      expect(sourceCode.getParent(bazPair.value!)).toBe(bazPair);
      // `baz: boop`
      expect(sourceCode.getParent(bazPair)).toBe(bazMap);
      // `baz: boop` map
      expect(sourceCode.getParent(bazMap)).toBe(barPair);
      // `bar:`
      expect(sourceCode.getParent(barPair.key)).toBe(barPair);
      // `bar: baz: boop`
      expect(sourceCode.getParent(barPair)).toBe(barMap);
      // `bar: ...` map
      expect(sourceCode.getParent(barMap)).toBe(seq);
      // `- bar: ...`
      expect(sourceCode.getParent(seq)).toBe(fooPair);
      // `foo:`
      expect(sourceCode.getParent(fooPair.key)).toBe(fooPair);
      // `foo: -baz: ...`
      expect(sourceCode.getParent(fooPair)).toBe(fooMap);
    });

    it('should return undefined for unknown parents', () => {
      const sourceCode = getSourceCodeForText('foo: 303');

      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      [...sourceCode.traverse()];

      const node = new Scalar(303);

      expect(sourceCode.getParent(node)).toBeUndefined();
    });
  });

  describe('traverse', () => {
    it('should produce steps for all nodes', () => {
      const sourceCode = getSourceCodeForText(`
foo:
- bar:
    baz: boop
      `);

      const steps = [...sourceCode.traverse()];
      const fooMap = sourceCode.ast.contents[0].contents as YAMLMap;

      expect(steps).toHaveLength(13);
      expect(steps[0].target).toBe(sourceCode.ast);
      expect(steps[0].args[0]).toBe(sourceCode.ast);
      expect(steps[0].args[1]).toBe(null);
      expect(steps[1].target).toBe(sourceCode.ast.contents[0]);
      expect(steps[1].args[0]).toBe(sourceCode.ast.contents[0]);
      expect(steps[1].args[1]).toBe(sourceCode.ast);
      expect(steps[2].target).toBe(fooMap);
      expect(steps[2].phase).toBe(1);
      expect(steps[2].args[0]).toBe(fooMap);
      expect(steps[2].args[1]).toBe(sourceCode.ast.contents[0]);
    });
  });

  describe('getTokenBefore', () => {
    it('should return null for unknown nodes', () => {
      const sourceCode = getSourceCodeForText('foo: 303');
      const node = new Scalar(303);
      expect(sourceCode.getTokenBefore(node)).toBeNull();
    });

    it('should return null for unknown tokens', () => {
      const sourceCode = getSourceCodeForText('foo: 303');
      const token = {
        type: 'comment',
        offset: 1,
        source: 'foo'
      } as CST.SourceToken;
      expect(sourceCode.getTokenBefore(token)).toBeNull();
    });

    it('should return previous token for nodes', () => {
      const sourceCode = getSourceCodeForText('foo: bar');
      const map = sourceCode.ast.contents[0].contents as YAMLMap;
      const pair = map.items[0] as Pair<Scalar, Scalar>;

      const pairValue = sourceCode.getTokenBefore(
        pair.value!
      ) as CST.SourceToken;
      expect(pairValue.type).toBe('space');
      expect(pairValue.source).toBe(' ');
    });

    it('should return null if no previous token for nodes', () => {
      const sourceCode = getSourceCodeForText('foo: bar');
      const map = sourceCode.ast.contents[0].contents as YAMLMap;
      const pair = map.items[0] as Pair<Scalar, Scalar>;

      const token = sourceCode.getTokenBefore(pair.key);
      expect(token).toBe(null);
    });

    it('should return previous token for pairs', () => {
      const sourceCode = getSourceCodeForText('foo: 303\nbar: 808');
      const map = sourceCode.ast.contents[0].contents as YAMLMap;
      const pair = map.items[1] as Pair<Scalar, Scalar>;

      const pairToken = sourceCode.getTokenBefore(pair) as CST.FlowScalar;
      expect(pairToken.type).toBe('scalar');
      expect(pairToken.source).toBe('303');
    });

    it('should return previous token for tokens', () => {
      const sourceCode = getSourceCodeForText('foo: 303');
      const map = sourceCode.ast.contents[0].contents as YAMLMap;
      const pair = map.items[0] as Pair<Scalar, Scalar>;
      const valueToken = pair.value!.srcToken as CST.FlowScalar;

      const token = sourceCode.getTokenBefore(valueToken) as CST.SourceToken;
      expect(token.type).toBe('space');
      expect(token.source).toBe(' ');
    });

    it('should return null if no previous token for tokens', () => {
      const sourceCode = getSourceCodeForText('foo: 303');
      const map = sourceCode.ast.contents[0].contents as YAMLMap;
      const pair = map.items[0] as Pair<Scalar, Scalar>;
      const keyToken = pair.key.srcToken as CST.FlowScalar;

      const token = sourceCode.getTokenBefore(keyToken);
      expect(token).toBe(null);
    });
  });

  describe('getTokenAfter', () => {
    it('should return null for unknown nodes', () => {
      const sourceCode = getSourceCodeForText('foo: 303');
      const node = new Scalar(303);
      expect(sourceCode.getTokenAfter(node)).toBeNull();
    });

    it('should return null for unknown tokens', () => {
      const sourceCode = getSourceCodeForText('foo: 303');
      const token = {
        type: 'comment',
        offset: 1,
        source: 'foo'
      } as CST.SourceToken;
      expect(sourceCode.getTokenAfter(token)).toBeNull();
    });

    it('should return next token for nodes', () => {
      const sourceCode = getSourceCodeForText('foo: bar # Comment');
      const map = sourceCode.ast.contents[0].contents as YAMLMap;
      const pair = map.items[0] as Pair<Scalar, Scalar>;

      const pairKey = sourceCode.getTokenAfter(pair.key) as CST.SourceToken;
      expect(pairKey.type).toBe('map-value-ind');
      expect(pairKey.source).toBe(':');
    });

    it('should return null if no next token for nodes', () => {
      const sourceCode = getSourceCodeForText('foo: bar');
      const map = sourceCode.ast.contents[0].contents as YAMLMap;
      const pair = map.items[0] as Pair<Scalar, Scalar>;

      const token = sourceCode.getTokenAfter(pair.value!);
      expect(token).toBe(null);
    });

    it('should return next token for pairs', () => {
      const sourceCode = getSourceCodeForText('foo: 303\nbar: 808');
      const map = sourceCode.ast.contents[0].contents as YAMLMap;
      const pair = map.items[0] as Pair<Scalar, Scalar>;

      const pairToken = sourceCode.getTokenAfter(pair) as CST.FlowScalar;
      expect(pairToken.type).toBe('scalar');
      expect(pairToken.source).toBe('bar');
    });

    it('should return next token for tokens', () => {
      const sourceCode = getSourceCodeForText('foo: 303 # Comment');
      const map = sourceCode.ast.contents[0].contents as YAMLMap;
      const pair = map.items[0] as Pair<Scalar, Scalar>;
      const keyToken = pair.key.srcToken as CST.FlowScalar;

      const token = sourceCode.getTokenAfter(keyToken) as CST.SourceToken;
      expect(token.type).toBe('map-value-ind');
      expect(token.source).toBe(':');
    });

    it('should return null if no next token for tokens', () => {
      const sourceCode = getSourceCodeForText('foo: 303');
      const map = sourceCode.ast.contents[0].contents as YAMLMap;
      const pair = map.items[0] as Pair<Scalar, Scalar>;
      const valueToken = pair.value!.srcToken as CST.FlowScalar;

      const token = sourceCode.getTokenAfter(valueToken);
      expect(token).toBe(null);
    });
  });
});
