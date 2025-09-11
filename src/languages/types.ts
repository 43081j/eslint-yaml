import {type Document, type Node, type Pair, type CST} from 'yaml';

export interface Root {
  type: 'root';
  tokens: CST.Token[];
  contents: Document[];
}

export type NodeLike = Node | Document | Pair;
