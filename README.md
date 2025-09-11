# ESLint YAML Language Plugin

This package contains a language plugin for ESLint which allows you to natively lint YAML files.

## Install

```sh
npm i -D eslint-yaml
```

## Usage

The following languages are exported:

- `yaml/yaml`

You can use it in your ESLint configuration like this:

```ts
import { defineConfig } from 'eslint/config';
import { yaml } from 'eslint-yaml';

export default defineConfig([
  {
    plugins: {
      yaml
    },
    language: 'yaml/yaml',
    files: ['*.yaml', '*.yml'],
    extends: [
      'yaml/recommended'
    ],
  },
]);
```

## Rules

| Rule Name | Description | Recommended |
| -- | -- | -- |
| no-empty-mapping-value | Disallow empty mapping values | ✅ |

## Configuration Comments

You can use ESLint [configuration comments](https://eslint.org/docs/latest/use/configure/rules#using-configuration-comments) and [disable directives](https://eslint.org/docs/latest/use/configure/rules#disabling-rules) in YAML files.

For example:

```yaml
foo: 303
# eslint-disable-next-line no-empty-mapping-value
bar:
baz: 808 # eslint-disable-line
```

## License

MIT
