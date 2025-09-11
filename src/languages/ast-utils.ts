import {type CST, isPair, isNode} from 'yaml';
import type {NodeLike, Root} from './types.js';

export function getNodeToken(
  node: NodeLike,
  end?: boolean
): CST.Token | undefined {
  if (isNode(node)) {
    return node.srcToken;
  }
  if (isPair(node) && node.srcToken) {
    if (end) {
      return node.srcToken.value;
    }
    if (node.srcToken.start.length > 0) {
      return node.srcToken.start[0];
    }
    return node.srcToken.key ?? undefined;
  }
  return undefined;
}

export function visitTokens(
  root: CST.Token,
  callback: (token: CST.Token) => void
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
        callback(currentNode);
        break;
      }
      case 'block-scalar': {
        queue.push(...currentNode.props);
        callback(currentNode);
        break;
      }
      case 'block-seq':
      case 'block-map': {
        for (const item of currentNode.items) {
          queue.push(...item.start);
          if (item.key) {
            queue.push(item.key);
          }
          if (item.sep) {
            queue.push(...item.sep);
          }
          if (item.value) {
            queue.push(item.value);
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
      default: {
        callback(currentNode);
      }
    }

    currentNode = queue.shift();
  }
}

export function getSiblingTokenFromMap(
  token: CST.Token,
  tokenMap: WeakMap<CST.Token, CST.Token>,
  includeComments: boolean
): CST.Token | undefined {
  let current = tokenMap.get(token);
  if (includeComments) {
    return current;
  }
  while (current && current.type === 'comment') {
    current = tokenMap.get(current);
  }
  return current;
}

export function processTokens(ast: Root): {
  tokenPrev: WeakMap<CST.Token, CST.Token>;
  tokenNext: WeakMap<CST.Token, CST.Token>;
  comments: CST.SourceToken[];
} {
  const tokenPrev = new WeakMap<CST.Token, CST.Token>();
  const tokenNext = new WeakMap<CST.Token, CST.Token>();
  let firstToken: CST.Token | undefined;
  let middleToken: CST.Token | undefined;
  const comments: CST.SourceToken[] = [];

  for (const rootToken of ast.tokens) {
    visitTokens(rootToken, (token) => {
      if (firstToken && middleToken) {
        tokenPrev.set(middleToken, firstToken);
        tokenNext.set(firstToken, middleToken);
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

    if (firstToken && middleToken) {
      tokenPrev.set(middleToken, firstToken);
    }
  }

  return {
    tokenPrev,
    tokenNext,
    comments
  };
}

export function isToken(value: unknown): value is CST.Token {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    value.constructor === Object &&
    typeof (value as CST.Token).type === 'string'
  );
}
