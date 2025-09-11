import {
  Parser,
  Composer,
  type Node,
  isAlias,
  isDocument,
  isMap,
  isPair,
  isScalar,
  isSeq,
  isNode,
  LineCounter,
  visit
} from 'yaml';
import {YAMLSourceCode} from './yaml-source-code.js';
import type {
  Language,
  ParseResult,
  OkParseResult,
  FileError,
  File,
  LanguageContext
} from '@eslint/core';
import type {NodeLike, Root} from './types.js';

export interface YAMLLanguageOptions {
  [key: PropertyKey]: unknown;
}

export type YAMLParseResult = ParseResult<Root>;
export type YAMLOkParseResult = OkParseResult<Root>;

function getNodeType(node: NodeLike): string {
  if (isAlias(node)) {
    return 'alias';
  }
  if (isDocument(node)) {
    return 'document';
  }
  if (isMap(node)) {
    return 'map';
  }
  if (isPair(node)) {
    return 'pair';
  }
  if (isScalar(node)) {
    return 'scalar';
  }
  if (isSeq(node)) {
    return 'seq';
  }
  return 'unknown';
}

function addNodeType(node: NodeLike): void {
  Object.defineProperty(node, 'type', {
    value: getNodeType(node)
  });
}

/**
 * YAML Language Object
 */
export class YAMLLanguage
  implements
    Language<{
      LangOptions: YAMLLanguageOptions;
      Code: YAMLSourceCode;
      RootNode: Root;
      Node: Node;
    }>
{
  /**
   * The type of file to read.
   */
  fileType: 'text' = 'text';

  /**
   * The line number at which the parser starts counting.
   */
  lineStart: 0 | 1 = 1;

  /**
   * The column number at which the parser starts counting.
   */
  columnStart: 0 | 1 = 1;

  /**
   * The name of the key that holds the type of the node.
   */
  nodeTypeKey: string = 'type';

  /**
   * The visitor keys.
   */
  visitorKeys: Record<string, string[]> = {
    root: ['contents'],
    document: ['contents'],
    map: ['items'],
    seq: ['items'],
    pair: ['key', 'value']
  };

  #lineCounter?: LineCounter;

  /**
   * Validates the language options.
   */
  validateLanguageOptions(_languageOptions: YAMLLanguageOptions): void {
    return;
  }

  /**
   * Parses the given file into an AST.
   */
  parse(
    file: File,
    _context: LanguageContext<YAMLLanguageOptions>
  ): YAMLParseResult {
    const text = file.body as string;
    const lineCounter = new LineCounter();

    this.#lineCounter = lineCounter;

    try {
      const parser = new Parser(lineCounter.addNewLine);
      const composer = new Composer({
        keepSourceTokens: true,
        lineCounter
      });
      const tokens = [...parser.parse(text)];
      const docs = [...composer.compose(tokens)];

      const root: Root = {
        type: 'root',
        tokens,
        contents: docs
      };

      const errors: FileError[] = [];

      for (const doc of docs) {
        for (const err of doc.errors) {
          const linePos = lineCounter.linePos(err.pos[0]);
          const line = linePos ? linePos.line : 1;
          const column = linePos ? linePos.col : 1;
          errors.push({
            line,
            column,
            message: err.message
          });
        }
      }

      if (errors.length > 0) {
        return {
          ok: false,
          errors
        };
      }

      for (const doc of docs) {
        // TODO (43081j): remove this if eslint ever allows node types to be
        // determined by a language function rather than a node property
        addNodeType(doc);

        visit(doc, (_key, node) => {
          if (isNode(node) || isPair(node) || isDocument(node)) {
            addNodeType(node);
          }
        });
      }

      return {
        ok: true,
        ast: root
      };
    } catch (err) {
      return {
        ok: false,
        errors: [
          {
            line: 0,
            column: 0,
            message: err instanceof Error ? err.message : String(err)
          }
        ]
      };
    }
  }

  /**
   * Creates a new `JSONSourceCode` object from the given information.
   */
  createSourceCode(file: File, parseResult: YAMLOkParseResult): YAMLSourceCode {
    return new YAMLSourceCode({
      text: file.body as string,
      ast: parseResult.ast,
      lineCounter: this.#lineCounter!
    });
  }
}
