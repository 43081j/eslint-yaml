import {
  VisitNodeStep,
  TextSourceCodeBase,
  ConfigCommentParser,
  Directive
} from '@eslint/plugin-kit';
import {
  type CST,
  type Pair,
  isPair,
  isNode,
  isDocument,
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
import type {NodeLike, Root} from './types.js';
import {
  getNodeToken,
  processTokens,
  getSiblingTokenFromMap,
  isToken
} from './ast-utils.js';

function isNodeLikePair(node: Pair): node is Pair<NodeLike, NodeLike> {
  return (
    (isNode(node.key) || isPair(node.key)) &&
    (isNode(node.value) || isPair(node.value))
  );
}

const commentParser = new ConfigCommentParser();

const INLINE_CONFIG =
  /^\s*eslint(?:-enable|-disable(?:(?:-next)?-line)?)?(?:\s|$)/u;

interface YAMLSourceCodeOptions {
  text: string;
  ast: Root;
  lineCounter: LineCounter;
}

function getCommentValue(comment: string): string {
  return comment.slice(1).trimStart();
}

/**
 * YAML Source Code Object
 */
export class YAMLSourceCode extends TextSourceCodeBase<{
  LangOptions: YAMLLanguageOptions;
  RootNode: Root;
  SyntaxElementWithLoc: NodeLike | CST.Token;
  ConfigNode: CST.SourceToken;
}> {
  /**
   * The AST of the source code.
   */
  ast: Root;

  /**
   * The comment tokens in the source code.
   */
  comments: CST.SourceToken[];

  #steps?: TraversalStep[];
  #parents: WeakMap<NodeLike, NodeLike> = new WeakMap();
  #lineCounter: LineCounter;
  #inlineConfigComments?: CST.SourceToken[];
  #tokenPrev: WeakMap<CST.Token, CST.Token>;
  #tokenNext: WeakMap<CST.Token, CST.Token>;

  constructor({text, ast, lineCounter}: YAMLSourceCodeOptions) {
    super({text, ast});
    this.ast = ast;
    this.#lineCounter = lineCounter;

    const processResult = processTokens(ast);
    this.comments = processResult.comments;
    this.#tokenPrev = processResult.tokenPrev;
    this.#tokenNext = processResult.tokenNext;
  }

  /** @inheritdoc */
  getInlineConfigNodes(): CST.SourceToken[] {
    if (!this.#inlineConfigComments) {
      this.#inlineConfigComments = this.comments.filter((comment) =>
        INLINE_CONFIG.test(getCommentValue(comment.source))
      );
    }

    return this.#inlineConfigComments;
  }

  /** @inheritdoc */
  getLoc(node: NodeLike | CST.Token): SourceLocation {
    if (isPair(node)) {
      if (!isNodeLikePair(node) || !node.value) {
        return {
          start: {line: 0, column: 0},
          end: {line: 0, column: 0}
        };
      }
      const {start} = this.getLoc(node.key);
      const {end} = this.getLoc(node.value);

      return {start, end};
    }

    if (isToken(node)) {
      return this.#getSourceTokenLoc(node);
    }

    // TODO (43081j): really we want `undefined` here but it looks like eslint
    // expects a source location either way
    if (!node.range) {
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
  getRange(node: NodeLike | CST.Token): SourceRange {
    if (isPair(node)) {
      if (!isNodeLikePair(node) || !node.value) {
        return [0, 0];
      }

      return [this.getRange(node.key)[0], this.getRange(node.value)[1]];
    }

    if (isToken(node)) {
      const nextToken = this.getTokenAfter(node);
      const endOffset = nextToken ? nextToken.offset - 1 : node.offset;
      return [node.offset, endOffset];
    }

    // TODO (43081j): really we want `undefined` here but it looks like eslint
    // expects a range one way or another?
    if (!node.range) {
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
      const parsedComment = commentParser.parseDirective(
        getCommentValue(comment.source)
      );

      if (!parsedComment) {
        continue;
      }

      const {label, value, justification} = parsedComment;

      switch (label) {
        case 'eslint-disable':
        case 'eslint-enable':
        case 'eslint-disable-next-line':
        case 'eslint-disable-line': {
          const directiveType: DirectiveType = label.slice(
            'eslint-'.length
          ) as DirectiveType;

          directives.push(
            new Directive({
              type: directiveType,
              node: comment,
              value,
              justification
            })
          );
        }
      }
    }

    return {problems, directives};
  }

  #getSourceTokenLoc(token: CST.Token): SourceLocation {
    const start = this.#lineCounter.linePos(token.offset);
    const nextToken = this.getTokenAfter(token);
    const end = this.#lineCounter.linePos(
      nextToken ? nextToken.offset - 1 : token.offset
    );
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
  applyInlineConfig(): {
    configs: Array<{loc: SourceLocation; config: {rules: RulesConfig}}>;
    problems: FileProblem[];
  } {
    const problems: FileProblem[] = [];
    const configs: Array<{loc: SourceLocation; config: {rules: RulesConfig}}> =
      [];

    for (const comment of this.getInlineConfigNodes()) {
      const parsedComment = commentParser.parseDirective(
        getCommentValue(comment.source)
      );

      if (!parsedComment) {
        continue;
      }

      const {label, value} = parsedComment;

      if (label === 'eslint') {
        const parseResult = commentParser.parseJSONLikeConfig(value);
        const loc = this.#getSourceTokenLoc(comment);

        if (parseResult.ok) {
          configs.push({
            config: {
              rules: parseResult.config
            },
            loc
          });
        } else {
          problems.push({
            ruleId: null,
            message: parseResult.error.message,
            loc
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
  getParent(node: NodeLike | CST.Token): NodeLike | undefined {
    if (isToken(node)) {
      return undefined;
    }
    return this.#parents.get(node);
  }

  /** @inheritdoc */
  traverse(): Iterable<TraversalStep> {
    if (this.#steps) {
      return this.#steps;
    }

    const steps: VisitNodeStep[] = [];

    this.#steps = steps;

    steps.push(
      new VisitNodeStep({
        target: this.ast,
        phase: 1,
        args: [this.ast, null]
      })
    );

    for (const doc of this.ast.contents) {
      steps.push(
        new VisitNodeStep({
          target: doc,
          phase: 1,
          args: [doc, this.ast]
        })
      );
      visit(doc, (_key, node, path) => {
        if (!isNode(node) && !isPair(node)) {
          return;
        }
        const parent = path.length > 0 ? path[path.length - 1] : null;
        if (parent) {
          this.#parents.set(node, parent);
        }
        steps.push(
          new VisitNodeStep({
            target: node,
            phase: 1,
            args: [node, parent]
          })
        );
      });
    }

    return steps;
  }

  /** @inheritdoc */
  getTokenBefore(
    nodeOrToken: CST.Token | NodeLike,
    {includeComments = false}: {includeComments?: boolean} = {}
  ): CST.Token | null {
    if (isNode(nodeOrToken) || isPair(nodeOrToken) || isDocument(nodeOrToken)) {
      const token = getNodeToken(nodeOrToken);
      if (!token) {
        return null;
      }
      return (
        getSiblingTokenFromMap(token, this.#tokenPrev, includeComments) ?? null
      );
    }
    return (
      getSiblingTokenFromMap(nodeOrToken, this.#tokenPrev, includeComments) ??
      null
    );
  }

  /** @inheritdoc */
  getTokenAfter(
    nodeOrToken: CST.Token | NodeLike,
    {includeComments = false}: {includeComments?: boolean} = {}
  ): CST.Token | null {
    if (isNode(nodeOrToken) || isPair(nodeOrToken) || isDocument(nodeOrToken)) {
      const token = getNodeToken(nodeOrToken, true);
      if (!token) {
        return null;
      }
      return (
        getSiblingTokenFromMap(token, this.#tokenNext, includeComments) ?? null
      );
    }
    return (
      getSiblingTokenFromMap(nodeOrToken, this.#tokenNext, includeComments) ??
      null
    );
  }
}
