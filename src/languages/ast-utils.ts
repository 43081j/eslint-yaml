import {
  type Document,
  type CST,
  isPair,
  isNode,
  isMap,
  isSeq,
  isDocument
} from 'yaml';
import type {NodeLike} from './types.js';

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

function visitFirstChild(
  node: NodeLike,
  visitor: (node: NodeLike, path: NodeLike[]) => unknown,
  path: NodeLike[] = []
) {
  if (visitor(node, path) === false) {
    return;
  }

  if (isDocument(node) && node.contents) {
    visitFirstChild(node.contents, visitor, [...path, node]);
    return;
  }

  if ((isMap(node) || isSeq(node)) && node.items.length > 0) {
    const firstChild = node.items[0];
    if (isNode(firstChild) || isPair(firstChild)) {
      visitFirstChild(firstChild, visitor, [...path, node]);
    }
    return;
  }

  if (isPair(node)) {
    if (node.key) {
      if (isNode(node.key)) {
        visitFirstChild(node.key, visitor, [...path, node]);
      }
    } else if (node.value && isNode(node.value)) {
      visitFirstChild(node.value, visitor, [...path, node]);
    }
    return;
  }
}

export function processTokens(ast: Document): {
  tokenPrev: WeakMap<CST.Token, CST.Token>;
  tokenNext: WeakMap<CST.Token, CST.Token>;
  comments: CST.SourceToken[];
} {
  const tokenPrev = new WeakMap<CST.Token, CST.Token>();
  const tokenNext = new WeakMap<CST.Token, CST.Token>();
  let firstToken: CST.Token | undefined;
  let middleToken: CST.Token | undefined;
  const comments: CST.SourceToken[] = [];

  if (ast.contents?.srcToken) {
    visitTokens(ast.contents.srcToken, (token) => {
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

    const firstComment = comments[0];

    // Serious hacks because the parser decided to throw away preceding
    // comments. One day when yaml#637 is fixed, we should be able to remove
    // this questionable workaround.
    visitFirstChild(ast, (node) => {
      if (isNode(node) && node.commentBefore && node.range) {
        if (firstComment === undefined || node.range[0] < firstComment.offset) {
          comments.unshift({
            type: 'comment',
            offset: Math.max(0, node.range[0] - node.commentBefore.length - 1),
            indent: 0,
            source: `#${node.commentBefore}`
          });
          return false;
        }
      }
    });
  }

  return {
    tokenPrev,
    tokenNext,
    comments
  };
}
