import { Node as ReactFlowNode, Edge } from 'reactflow';

export enum NodeType {
  CENTRAL_ADDRESS = 'centralAddress',
  CONNECTED_ADDRESS = 'connectedAddress',
  INCOMING_TRANSACTION = 'incomingTransaction',
  OUTGOING_TRANSACTION = 'outgoingTransaction',
  SELF_TRANSACTION = 'selfTransaction',
}

export interface BaseNodeData {
  label: string;
  fullLabel?: string;
  address?: string;
}

export interface CentralAddressNodeData extends BaseNodeData {
  balance: string;
  transactionCount: number;
  totalIncoming: string;
  totalOutgoing: string;
}

export interface ConnectedAddressNodeData extends BaseNodeData {
  transactionCount: number;
  totalAmount: string;
  isContract?: boolean;
}

export interface TransactionNodeData extends BaseNodeData {
  hash: string;
  timestamp: number;
  amount: string;
  fromAddress: string;
  toAddress: string;
  confirmations?: number;
  fee?: string;
  type: 'incoming' | 'outgoing' | 'self';
  isSelfTransfer?: boolean;
}

export type CustomNodeData =
  | CentralAddressNodeData
  | ConnectedAddressNodeData
  | TransactionNodeData;

export interface CustomNode extends ReactFlowNode {
  type: NodeType;
  data: CustomNodeData;
}

export interface CustomEdgeData {
  amount: string;
  label: string;
  animated?: boolean;
  type: 'incoming' | 'outgoing';
  hash?: string;
}

export type CustomEdge = Edge<CustomEdgeData>;

export interface GraphData {
  nodes: CustomNode[];
  edges: CustomEdge[];
}

export interface NodePosition {
  x: number;
  y: number;
}

