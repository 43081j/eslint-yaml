import {ESLint, type Linter} from 'eslint';
import {expect, describe, it, beforeEach} from 'vitest';
import * as yaml from '../src/main.js';

describe('main', () => {
  it('should export correct shape', () => {
    expect(yaml.yaml).toBeDefined();
    expect(yaml.YAMLSourceCode).toBeDefined();
    expect(yaml.YAMLLanguage).toBeDefined();
    expect(Object.keys(yaml.yaml)).toEqual([
      'meta',
      'languages',
      'rules',
      'configs'
    ]);
  });

  it('should correctly set recommended config', () => {
    const recommendedConfig = yaml.yaml.configs?.recommended as Linter.Config;
    expect(recommendedConfig.plugins?.yaml).toBe(yaml.yaml);
    expect(recommendedConfig.rules).toEqual({
      'yaml/no-empty-mapping-value': 'error'
    });
  });

  describe('eslint integration', () => {
    let eslint: ESLint;

    beforeEach(() => {
      eslint = new ESLint({
        overrideConfigFile: true,
        overrideConfig: {
          files: ['**/*.yaml'],
          plugins: {yaml: yaml.yaml},
          language: 'yaml/yaml',
          rules: {
            'yaml/no-empty-mapping-value': 'error'
          }
        }
      });
    });

    it('should raise diagnostics', async () => {
      const result = await eslint.lintText('key:', {filePath: 'test.yaml'});
      expect(result[0].messages).toMatchSnapshot();
    });
  });
});
