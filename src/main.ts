import type {ESLint} from 'eslint';
import {YAMLanguage} from './languages/yaml-language.js';
import {YAMLSourceCode} from './languages/yaml-source-code.js';
import {createConfig as createRecommendedConfig} from './configs/recommended.js';
import {rules} from './rules/all.js';

const plugin: ESLint.Plugin = {
  meta: {
    name: 'eslint-yaml',
    version: '0.0.1'
  },
  languages: {
    yaml: new YAMLLanguage()
  },
  rules
};

plugin.configs = {
  recommended: createRecommendedConfig(plugin)
};

export default plugin;
export {YAMLSourceCode};
export * from './languages/yaml-language.js';
