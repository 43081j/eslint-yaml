import {type Pair, type CST, isNode, isCollection} from 'yaml';
import type {YAMLRuleDefinition} from '../rule.js';
import type {NodeLike} from '../languages/types.js';
import type {YAMLSourceCode} from '../languages/yaml-source-code.js';

function isColon(token: CST.Token): token is CST.SourceToken {
  return token.type === 'map-value-ind' && token.source === ':';
}

/**
 * Get the colon token from the given pair node.
 */
function getColonToken(sourceCode: YAMLSourceCode, pair: Pair) {
  if (!isNode(pair.key) || !pair.key.range || !isNode(pair.value)) {
    return null;
  }
  const limitIndex = pair.key.range[1];
  let candidateColon = sourceCode.getTokenBefore(pair.value);
  while (candidateColon && !isColon(candidateColon)) {
    candidateColon = sourceCode.getTokenBefore(candidateColon);
    if (candidateColon && candidateColon.offset <= limitIndex) {
      return null;
    }
  }
  if (!candidateColon || !isColon(candidateColon)) {
    return null;
  }
  return candidateColon;
}

/**
 * Checks whether the newline between the given value node and the colon can be removed.
 */
function canRemoveNewline(value: NodeLike) {
  if (isCollection(value) && !value.flow) {
    return false;
  }
  return true;
}

type MessageId =
  | 'unexpectedLinebreakAfterIndicator'
  | 'expectedLinebreakAfterIndicator';

export const rule: YAMLRuleDefinition<['always' | 'never'], MessageId> = {
  meta: {
    docs: {
      description: 'enforce consistent line breaks after `:` indicator'
    },
    fixable: 'whitespace',
    schema: [
      {
        enum: ['always', 'never']
      }
    ],
    messages: {
      unexpectedLinebreakAfterIndicator:
        'Unexpected line break after this `:` indicator.',
      expectedLinebreakAfterIndicator:
        'Expected a line break after this `:` indicator.'
    },
    type: 'layout'
  },
  create(context) {
    const sourceCode = context.sourceCode;
    const option = context.options[0] || 'never';

    return {
      Map(node) {
        if (node.flow) {
          return;
        }

        for (const pair of node.items) {
          const value = pair.value;
          if (!isNode(value) || !value.range) {
            continue;
          }
          const colon = getColonToken(sourceCode, pair);
          const valueRange = value.range;
          if (!colon) {
            return;
          }

          const colonLoc = sourceCode.getLoc(colon);
          const valueLoc = sourceCode.getLoc(value);
          const hasNewline = colonLoc.end.line < valueLoc.start.line;
          if (hasNewline) {
            if (option === 'never') {
              if (!canRemoveNewline(value)) {
                return;
              }
              context.report({
                loc: colonLoc,
                messageId: 'unexpectedLinebreakAfterIndicator',
                fix(fixer) {
                  const spaceCount =
                    valueLoc.start.column - colonLoc.end.column;
                  if (
                    spaceCount < 1 &&
                    valueLoc.start.line < valueLoc.end.line
                  ) {
                    // Stop auto-fix as it can break the indentation of multi-line value.
                    return null;
                  }
                  const spaces = ' '.repeat(Math.max(spaceCount, 1));
                  return fixer.replaceTextRange(
                    [colon.offset, valueRange[0]],
                    spaces
                  );
                }
              });
            }
          } else {
            if (option === 'always') {
              context.report({
                loc: colonLoc,
                messageId: 'expectedLinebreakAfterIndicator',
                fix(fixer) {
                  const spaces = `\n${' '.repeat(valueLoc.start.column)}`;
                  return fixer.replaceTextRange(
                    [colon.offset, valueRange[0]],
                    spaces
                  );
                }
              });
            }
          }
        }
      }
    };
  }
};
