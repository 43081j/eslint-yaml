import {
  type CustomRuleDefinitionType,
  type RuleVisitor,
  type LanguageOptions
} from '@eslint/core';
import type {YAMLSourceCode} from './languages/yaml-source-code.js';
import type {NodeLike, Root} from './languages/types.js';
import type {Document, Pair, Scalar, Alias, YAMLMap, YAMLSeq} from 'yaml';

export type YAMLRuleVisitor = RuleVisitor & {
  Root?(node: Root): void;
  Document?(node: Document, parent?: NodeLike): void;
  Pair?(node: Pair, parent?: NodeLike): void;
  Scalar?(node: Scalar, parent?: NodeLike): void;
  Alias?(node: Alias, parent?: NodeLike): void;
  Map?(node: YAMLMap, parent?: NodeLike): void;
  Seq?(node: YAMLSeq, parent?: NodeLike): void;
};

export type YAMLRuleDefinition<
  RuleOptions extends unknown[],
  MessageIds extends string
> = CustomRuleDefinitionType<
  {
    Code: YAMLSourceCode;
    Node: NodeLike;
    Visitor: YAMLRuleVisitor;
    LangOptions: LanguageOptions;
  },
  {
    RuleOptions: RuleOptions;
    MessageIds: MessageIds;
  }
>;
