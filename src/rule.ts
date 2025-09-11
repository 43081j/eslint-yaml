import {
  type RuleDefinition,
  type RuleVisitor,
  type LanguageOptions
} from '@eslint/core';
import type {YAMLSourceCode} from './languages/yaml-source-code.js';
import type {NodeLike} from './languages/types.js';

export type YAMLRuleDefinition<
  RuleOptions extends unknown[],
  MessageIds extends string
> = RuleDefinition<{
  Code: YAMLSourceCode;
  Node: NodeLike;
  Visitor: RuleVisitor;
  RuleOptions: RuleOptions;
  MessageIds: MessageIds;
  ExtRuleDocs: unknown;
  LangOptions: LanguageOptions;
}>;
