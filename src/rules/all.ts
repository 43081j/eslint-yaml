import type {RuleDefinition} from '@eslint/core';
import {noEmptyMappingValueRule} from './no-empty-mapping-value.js';

export const rules: Record<string, RuleDefinition> = {
  'no-empty-mapping-value': noEmptyMappingValueRule
};
