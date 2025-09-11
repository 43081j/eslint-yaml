import {
  VisitNodeStep,
  TextSourceCodeBase,
  ConfigCommentParser,
  Directive
} from '@eslint/plugin-kit';
import {
  CST,
  isPair,
  isNode,
  isDocument,
  type LineCounter,
  type Range,
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

const commentParser = new ConfigCommentParser();

const INLINE_CONFIG =
  /^\s*eslint(?:-enable|-disable(?:(?:-next)?-line)?)?(?:\s|$)/u;

interface YAMLSourceCodeOptions {
  text: string;
  ast: Root;
  lineCounter: LineCounter;
}

const getNodeRange = (node: NodeLike): Range | undefined => {
  if (isPair(node)) {
    if (!isNode(node.key) || !node.key.range) {
      return undefined;
    }
    let rangeEnd: Range = node.key.range;
    if (isNode(node.value) && node.value.range) {
      rangeEnd = node.value.range;
    }
    return [node.key.range[0], rangeEnd[1], rangeEnd[2]];
  }
  return node.range ?? undefined;
};

const getTokenByOffset = (
  tokens: CST.Token[],
  offset: number
): CST.SourceToken | undefined => {
  for (const rootToken of tokens) {
    let foundToken: CST.SourceToken | undefined;
    visitSourceTokens(rootToken, (token) => {
      if (token.offset === offset) {
        foundToken = token;
        return false;
      }
    });
    if (foundToken) {
      return foundToken;
    }
  }
  return undefined;
};
const getFirstToken = (
  tokens: CST.Token[],
  node: NodeLike
): CST.SourceToken | undefined => {
  const range = getNodeRange(node);
  if (!range) {
    return undefined;
  }
  return getTokenByOffset(tokens, range[0]);
};
const getLastToken = (
  tokens: CST.Token[],
  node: NodeLike
): CST.SourceToken | undefined => {
  const range = getNodeRange(node);
  if (!range) {
    return undefined;
  }
  return getTokenByOffset(tokens, range[2]);
};

function visitSourceTokens(
  root: CST.Token,
  callback: (token: CST.SourceToken) => void
): void {
  const queue: CST.Token[] = [];
  let currentNode: CST.Token | undefined = root;

  while (currentNode) {
    switch (currentNode.type) {
      case 'document': {
        queue.push(...currentNode.start);
        if (currentNode.value) {
          queue.push(currentNode.value);
        }
        if (currentNode.end) {
          queue.push(...currentNode.end);
        }
        break;
      }
      case 'doc-end':
      case 'alias':
      case 'scalar':
      case 'single-quoted-scalar':
      case 'double-quoted-scalar': {
        if (currentNode.end) {
          queue.push(...currentNode.end);
        }
        break;
      }
      case 'block-scalar': {
        queue.push(...currentNode.props);
        break;
      }
      case 'block-seq':
      case 'block-map': {
        for (const item of currentNode.items) {
          queue.push(...item.start);
          if (item.value) {
            queue.push(item.value);
          }
          if (item.key) {
            queue.push(item.key);
          }
          if (item.sep) {
            queue.push(...item.sep);
          }
        }
        break;
      }
      case 'flow-collection': {
        queue.push(currentNode.start);
        for (const item of currentNode.items) {
          if (item.key) {
            queue.push(item.key);
          }
          if (item.value) {
            queue.push(item.value);
          }
        }
        queue.push(...currentNode.end);
        break;
      }
      case 'directive':
      case 'error':
        break;
      default: {
        callback(currentNode);
      }
    }

    currentNode = queue.shift();
  }
}

function getSiblingTokenFromMap(
  token: CST.SourceToken,
  tokenMap: WeakMap<CST.SourceToken, CST.SourceToken>,
  includeComments: boolean
): CST.SourceToken | undefined {
  let current = tokenMap.get(token);
  if (includeComments) {
    return current;
  }
  while (current && current.type === 'comment') {
    current = tokenMap.get(current);
  }
  return current;
}

function processTokens(ast: Root): {
  tokenPrev: WeakMap<CST.SourceToken, CST.SourceToken>;
  tokenNext: WeakMap<CST.SourceToken, CST.SourceToken>;
  comments: CST.SourceToken[];
} {
  const tokenPrev = new WeakMap<CST.SourceToken, CST.SourceToken>();
  const tokenNext = new WeakMap<CST.SourceToken, CST.SourceToken>();
  let firstToken: CST.SourceToken | undefined;
  let middleToken: CST.SourceToken | undefined;
  const comments: CST.SourceToken[] = [];

  for (const rootToken of ast.tokens) {
    visitSourceTokens(rootToken, (token) => {
      if (firstToken && middleToken) {
        tokenPrev.set(firstToken, middleToken);
        tokenNext.set(middleToken, token);
      }
      if (!firstToken) {
        firstToken = token;
      } else if (!middleToken) {
        middleToken = token;
      } else {
        firstToken = middleToken;
        middleToken = token;
      }

      if (token.type === 'comment') {
        comments.push(token);
      }
    });
  }

  return {
    tokenPrev,
    tokenNext,
    comments
  };
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
  SyntaxElementWithLoc: NodeLike;
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
  #tokenPrev: WeakMap<CST.SourceToken, CST.SourceToken>;
  #tokenNext: WeakMap<CST.SourceToken, CST.SourceToken>;

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

  #getSourceTokenLoc(token: CST.SourceToken): SourceLocation {
    const start = this.#lineCounter.linePos(token.offset);
    const end = this.#lineCounter.linePos(token.offset + token.source.length);
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
  getParent(node: NodeLike): NodeLike | undefined {
    return this.#parents.get(node);
  }

  /** @inheritdoc */
  traverse(): Iterable<TraversalStep> {
    if (this.#steps) {
      return this.#steps;
    }

    const steps: VisitNodeStep[] = [];

    this.#steps = steps;

    for (const doc of this.ast.contents) {
      steps.push(
        new VisitNodeStep({
          target: doc,
          phase: 1,
          args: [doc, null]
        })
      );

      visit(doc, (_key, node, path) => {
        if (!isNode(node) && !isPair(node)) {
          return;
        }
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
      });
    }

    return steps;
  }

  /** @inheritdoc */
  getTokenBefore(
    nodeOrToken: CST.SourceToken | NodeLike,
    {includeComments = false}: {includeComments?: boolean} = {}
  ): CST.SourceToken | null {
    if (isNode(nodeOrToken) || isPair(nodeOrToken) || isDocument(nodeOrToken)) {
      const token = getFirstToken(this.ast.tokens, nodeOrToken);
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
    nodeOrToken: CST.SourceToken | NodeLike,
    {includeComments = false}: {includeComments?: boolean} = {}
  ): CST.SourceToken | null {
    if (isNode(nodeOrToken) || isPair(nodeOrToken) || isDocument(nodeOrToken)) {
      const token = getLastToken(this.ast.tokens, nodeOrToken);
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
