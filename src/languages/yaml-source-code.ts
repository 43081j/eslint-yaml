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
  type YAMLMap,
  type YAMLSeq,
  isPair,
  isNode,
  isSeq,
  isMap,
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

function processTokens(
  node: CST.Token,
  comments: CST.SourceToken[] = []
): void {
  switch (node.type) {
    case 'comment':
      comments.push(node);
      break;
    case 'document':
    case 'doc-end':
    case 'alias':
    case 'scalar':
    case 'single-quoted-scalar':
    case 'double-quoted-scalar': {
      if (node.end) {
        for (const childToken of node.end) {
          processTokens(childToken, comments);
        }
      }
      break;
    }
    case 'block-scalar': {
      for (const childToken of node.props) {
        processTokens(childToken, comments);
      }
      break;
    }
    case 'block-seq':
    case 'block-map': {
      for (const item of node.items) {
        for (const childToken of item.start) {
          processTokens(childToken, comments);
        }
        if (item.value) {
          processTokens(item.value, comments);
        }
        if (item.key) {
          processTokens(item.key, comments);
        }
      }
      break;
    }
    case 'flow-collection': {
      processTokens(node.start, comments);
      for (const item of node.items) {
        if (item.key) {
          processTokens(item.key, comments);
        }
        if (item.value) {
          processTokens(item.value, comments);
        }
      }
      for (const childToken of node.end) {
        processTokens(childToken, comments);
      }
      break;
    }
  }
}

function getCommentValue(comment: string): string {
  return comment.slice(1).trimLeft();
}

/**
 * YAML Source Code Object
 */
export class YAMLSourceCode extends TextSourceCodeBase<{
  LangOptions: YAMLLanguageOptions;
  RootNode: Document;
  SyntaxElementWithLoc: NodeLike;
  ConfigNode: CST.SourceToken;
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
  #parents: WeakMap<NodeLike, NodeLike> = new WeakMap();
  #lineCounter: LineCounter;
  #inlineConfigComments?: CST.SourceToken[];
  #tokenStarts: Map<number, number> = new Map();
  #tokenEnds: Map<number, number> = new Map();

  constructor({text, ast, lineCounter}: YAMLSourceCodeOptions) {
    super({text, ast});
    this.ast = ast;
    this.#lineCounter = lineCounter;

    visit(ast, {
      Node: (_key, node) => {
        if (!node.srcToken) {
          return;
        }

        processTokens(node.srcToken, this.comments);
      }
    });
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

    visit(this.ast, (_key, node, path) => {
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
