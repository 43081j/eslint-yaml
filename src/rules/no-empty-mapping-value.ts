import type {RuleDefinition} from '@eslint/core';

export const noEmptyMappingValueRule: RuleDefinition = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow empty mapping values in YAML.',
      category: 'Possible Errors',
      recommended: true
    },
    schema: [],
    messages: {
      emptyMappingValue: 'Empty mapping value is not allowed.'
    }
  },
  create(context) {
    return {
      Pair(node) {
        if (
          node.value === null ||
          node.value === undefined ||
          (node.value.type === 'Scalar' && node.value.value === null)
        ) {
          context.report({
            node,
            messageId: 'emptyMappingValue'
          });
        }
      }
    };
  }
};
