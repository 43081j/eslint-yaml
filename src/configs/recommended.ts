import type {ESLint, Linter} from 'eslint';

export function createConfig(plugin: ESLint.Plugin): Linter.Config {
  return {
    plugins: {
      yaml: plugin
    },
    rules: {
      'yaml/no-empty-mapping-value': 'error'
    }
  };
}
