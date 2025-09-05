import {
  VisitNodeStep,
  TextSourceCodeBase,
  ConfigCommentParser,
  Directive
} from '@eslint/plugin-kit';
import {
  type Document,
  type Node,
  type Pair,
  type CST,
  isPair,
  type LineCounter,
  visit
} from 'yaml';
import {
  SourceLocation,
  FileProblem,
  DirectiveType,
  RulesConfig,
  SourceRange,
  type TraversalStep
} from '@eslint/core';
import {YAMLLanguageOptions} from './yaml-language.js';

const commentParser = new ConfigCommentParser();

const INLINE_CONFIG =
  /^\s*eslint(?:-enable|-disable(?:(?:-next)?-line)?)?(?:\s|$)/u;

type NodeLike = Node | Document | Pair;

interface YAMLSourceCodeOptions {
  text: string;
  ast: Document;
  lineCounter: LineCounter;
}

/**
 * YAML Source Code Object
 */
export class YAMLSourceCode extends TextSourceCodeBase<{
  LangOptions: YAMLLanguageOptions;
  RootNode: Document;
  SyntaxElementWithLoc: NodeLike;
  ConfigNode: unknown;
}> {
  /**
   * The AST of the source code.
   */
  ast: Document;

  /**
   * The comment tokens in the source code.
   */
  comments: CST.SourceToken[] = [];

  #steps?: TraversalStep[];
  #parents: WeakMap<Node, NodeLike> = new WeakMap();
  #lineCounter: LineCounter;

  constructor({text, ast, lineCounter}: YAMLSourceCodeOptions) {
    super({text, ast});
    this.ast = ast;
    this.#lineCounter = lineCounter;
  }

  /** @inheritdoc */
  getInlineConfigNodes(): unknown[] {}

  /** @inheritdoc */
  getLoc(node: NodeLike): SourceLocation {
    // TODO (43081j): really we want `undefined` here but it looks like eslint
    // expects a source location either way
    if (isPair(node) || !node.range) {
      return {
        start: {line: 0, column: 0},
        end: {line: 0, column: 0}
      };
    }
    const start = this.#lineCounter.linePos(node.range[0]);
    const end = this.#lineCounter.linePos(node.range[2]);
    return {
      start: {
        line: start.line,
        column: start.col
      },
      end: {
        line: end.line,
        column: end.col
      }
    };
  }

  /** @inheritdoc */
  getRange(node: NodeLike): SourceRange {
    // TODO (43081j): really we want `undefined` here but it looks like eslint
    // expects a range one way or another?
    if (isPair(node) || !node.range) {
      return [0, 0];
    }
    return [node.range[0], node.range[2]];
  }

  /** @inheritdoc */
  getDisableDirectives(): {
    directives: Directive[];
    problems: FileProblem[];
  } {
    const problems: FileProblem[] = [];
    const directives: Directive[] = [];

    for (const comment of this.getInlineConfigNodes()) {
      const {label, value, justification} = commentParser.parseDirective(
        this.#getCommentValue(comment)
      );

      // `eslint-disable-line` directives are not allowed to span multiple lines as it would be confusing to which lines they apply
      if (
        label === 'eslint-disable-line' &&
        comment.loc.start.line !== comment.loc.end.line
      ) {
        const message = `${label} comment should not span multiple lines.`;

        problems.push({
          ruleId: null,
          message,
          loc: comment.loc
        });
        return;
      }

      switch (label) {
        case 'eslint-disable':
        case 'eslint-enable':
        case 'eslint-disable-next-line':
        case 'eslint-disable-line': {
          const directiveType = label.slice('eslint-'.length);

          directives.push(
            new Directive({
              type: /** @type {DirectiveType} */ directiveType,
              node: comment,
              value,
              justification
            })
          );
        }

        // no default
      }
    }

    return {problems, directives};
  }

  /** @inheritdoc */
  applyInlineConfig(): {
    configs: Array<{loc: SourceLocation; config: {rules: RulesConfig}}>;
    problems: FileProblem[];
  } {
    const problems: FileProblem[] = [];
    const configs: Array<{loc: SourceLocation; config: {rules: RulesConfig}}> =
      [];

    for (const comment of this.getInlineConfigNodes()) {
      const {label, value} = commentParser.parseDirective(
        this.#getCommentValue(comment)
      );

      if (label === 'eslint') {
        const parseResult = commentParser.parseJSONLikeConfig(value);

        if (parseResult.ok) {
          configs.push({
            config: {
              rules: parseResult.config
            },
            loc: comment.loc
          });
        } else {
          problems.push({
            ruleId: null,
            message:
              /** @type {{ok: false, error: { message: string }}} */ parseResult
                .error.message,
            loc: comment.loc
          });
        }
      }
    }

    return {
      configs,
      problems
    };
  }

  /** @inheritdoc */
  getParent(node: Node): NodeLike | undefined {
    return this.#parents.get(node);
  }

  /** @inheritdoc */
  traverse(): Iterable<TraversalStep> {
    if (this.#steps) {
      return this.#steps;
    }

    const steps: VisitNodeStep[] = [];

    this.#steps = steps;

    visit(this.ast, {
      Node: (_key, node, path) => {
        if (path.length > 0) {
          this.#parents.set(node, path[path.length - 1]);
        }
        steps.push(
          new VisitNodeStep({
            target: node,
            phase: 1,
            args: [node, null]
          })
        );
      }
    });

    return steps;
  }

  /** @inheritdoc */
  getTokenBefore(
    nodeOrToken: CST.SourceToken | NodeLike,
    {includeComments = false}: {includeComments?: boolean} = {}
  ): CST.SourceToken | null {
    // TODO
    return null;
  }

  /** @inheritdoc */
  getTokenAfter(
    nodeOrToken: CST.SourceToken | NodeLike,
    {includeComments = false}: {includeComments?: boolean} = {}
  ): CST.SourceToken | null {
    // TODO
    return null;
  }
}
