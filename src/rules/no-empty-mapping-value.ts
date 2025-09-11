import type {YAMLRuleDefinition} from '../rule.js';
import {isScalar} from 'yaml';

type MessageId = 'emptyMappingValue';

export const rule: YAMLRuleDefinition<[], MessageId> = {
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
          (isScalar(node.value) && node.value.value === null)
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
