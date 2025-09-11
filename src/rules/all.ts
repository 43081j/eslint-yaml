import type {RuleDefinition} from '@eslint/core';
import {rule as noEmptyMappingValueRule} from './no-empty-mapping-value.js';
import {rule as blockMappingColonIndicatorNewlineRule} from './block-mapping-colon-indicator-newline.js';

export const rules: Record<string, RuleDefinition> = {
  'no-empty-mapping-value': noEmptyMappingValueRule,
  'block-mapping-colon-indicator-newline': blockMappingColonIndicatorNewlineRule
};
