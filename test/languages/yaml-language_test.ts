import {Document} from 'yaml';
import {
  YAMLLanguage,
  type YAMLOkParseResult
} from '../../src/languages/yaml-language.js';
import {YAMLSourceCode} from '../../src/languages/yaml-source-code.js';
import {expect, describe, it} from 'vitest';

describe('YAMLLanguage', () => {
  it('should setup basic properties', () => {
    const language = new YAMLLanguage();
    expect(language.fileType).toBe('text');
    expect(language.lineStart).toBe(1);
    expect(language.columnStart).toBe(1);
    expect(language.nodeTypeKey).toBe('type');
  });

  describe('visitorKeys', () => {
    it('should have visitorKeys property', () => {
      const language = new YAMLLanguage();

      expect(language.visitorKeys.document).toEqual(['contents']);
    });
  });

  describe('validateLanguageOptions()', () => {
    it('should always pass', () => {
      const language = new YAMLLanguage();
      expect(() => language.validateLanguageOptions({})).not.toThrow();
    });
  });

  describe('parse()', () => {
    it('should parse basic YAML', () => {
      const language = new YAMLLanguage();
      const result = language.parse(
        {
          body: 'foo: "bar"',
          path: 'test.yaml',
          physicalPath: '/test.yaml',
          bom: false
        },
        {languageOptions: {}}
      );

      expect(result.ok).toBe(true);
      expect(result.ast.type).toBe('root');
      expect(result.ast.contents.length).toBe(1);
      expect(result.ast.contents[0]).instanceOf(Document);
      expect(result.ast.contents[0].contents.type).toBe('map');
    });

    it('should raise errors', () => {
      const language = new YAMLLanguage();
      const result = language.parse(
        {
          body: 'foo: "bar"\nfoo: "bar"',
          path: 'test.yaml',
          physicalPath: '/test.yaml',
          bom: false
        },
        {languageOptions: {}}
      );

      expect(result).toMatchSnapshot();
    });

    it('should raise multiple errors', () => {
      const language = new YAMLLanguage();
      const result = language.parse(
        {
          body: 'foo: "bar"\nfoo: "bar"\nfoo: "bar"',
          path: 'test.yaml',
          physicalPath: '/test.yaml',
          bom: false
        },
        {languageOptions: {}}
      );

      expect(result).toMatchSnapshot();
    });

    it('should set node types', () => {
      const language = new YAMLLanguage();
      const result = language.parse(
        {
          body: 'foo: "bar"',
          path: 'test.yaml',
          physicalPath: '/test.yaml',
          bom: false
        },
        {languageOptions: {}}
      );

      expect(result.ok).toBe(true);
      expect(result.ast.type).toBe('root');
      expect(result.ast.contents[0].type).toBe('document');
      expect(result.ast.contents[0].contents.type).toBe('map');
    });
  });

  describe('createSourceCode()', () => {
    it('should create a YAMLSourceCode instance', () => {
      const language = new YAMLLanguage();
      const file = {
        body: 'foo: "bar"',
        path: 'test.yaml',
        physicalPath: '/test.yaml',
        bom: false
      };
      const parseResult = language.parse(file, {
        languageOptions: {}
      }) as YAMLOkParseResult;
      const sourceCode = language.createSourceCode(file, parseResult);

      expect(sourceCode).instanceOf(YAMLSourceCode);
    });
  });
});
