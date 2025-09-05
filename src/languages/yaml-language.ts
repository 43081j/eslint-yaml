import {
  parseDocument,
  type Node,
  type Document,
  isAlias,
  isDocument,
  isMap,
  isPair,
  isScalar,
  isSeq,
  LineCounter,
  visit
} from 'yaml';
import {YAMLSourceCode} from './yaml-source-code.js';
import type {
  Language,
  ParseResult,
  OkParseResult,
  File,
  LanguageContext
} from '@eslint/core';

export interface YAMLLanguageOptions {
  [key: PropertyKey]: unknown;
}

export type YAMLParseResult = ParseResult<Document>;
export type YAMLOkParseResult = OkParseResult<Document>;

function getNodeType(node: Node): string {
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

function addNodeType(node: Node): void {
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
      RootNode: Document;
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
  visitorKeys?: Record<string, string[]> = {
    document: ['contents'],
    map: ['items'],
    seq: ['items'],
    pair: ['key', 'value']
  };

  lineCounter?: LineCounter;

  /**
   * Validates the language options.
   */
  validateLanguageOptions(languageOptions: YAMLLanguageOptions): void {}

  /**
   * Parses the given file into an AST.
   */
  parse(
    file: File,
    _context: LanguageContext<YAMLLanguageOptions>
  ): YAMLParseResult {
    const text = file.body as string;
    const lineCounter = new LineCounter();

    this.lineCounter = lineCounter;

    try {
      const root = parseDocument(text, {
        prettyErrors: true,
        keepSourceTokens: true,
        lineCounter
      });

      if (root.errors.length > 0) {
        return {
          ok: false,
          errors: root.errors.map((err) => {
            const linePos = err.linePos ? err.linePos[0] : undefined;
            const line = linePos ? linePos.line : 0;
            const column = linePos ? linePos.col : 0;
            return {
              line,
              column,
              message: err.message
            };
          })
        };
      }

      // TODO (43081j): remove this if eslint ever allows node types to be
      // determined by a language function rather than a node property
      visit(root, {
        Node(_key, node) {
          addNodeType(node);
        }
      });

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
      lineCounter: this.lineCounter!
    });
  }
}
