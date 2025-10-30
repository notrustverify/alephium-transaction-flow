import dagre from 'dagre';
import { Position } from 'reactflow';
import {
  AddressTransaction,
  CustomNode,
  CustomEdge,
  NodeType,
  GraphData,
  CentralAddressNodeData,
  ConnectedAddressNodeData,
  TransactionNodeData,
} from '../types';
import { alephiumService } from '../services/alephiumService';

const NODE_WIDTH = 180;
const NODE_HEIGHT = 80;
const TRANSACTION_NODE_WIDTH = 200;
const TRANSACTION_NODE_HEIGHT = 100;

export const transformTransactionsToGraph = (
  centralAddress: string,
  transactions: AddressTransaction[],
  balance: string,
  showIncoming: boolean = true,
  showOutgoing: boolean = true
): GraphData => {
  // Map to store contract status
  const contractStatusMap = new Map<string, boolean>();
  const nodes: CustomNode[] = [];
  const edges: CustomEdge[] = [];
  const addressMap = new Map<string, { count: number; amount: bigint; type: 'incoming' | 'outgoing' }>();

  // Filter transactions based on visibility settings
  const filteredTransactions = transactions.filter((tx) => {
    if (!showIncoming && tx.type === 'incoming') return false;
    if (!showOutgoing && tx.type === 'outgoing') return false;
    return true;
  });

  // Calculate statistics for connected addresses
  for (const tx of filteredTransactions) {
    const otherAddress = tx.type === 'incoming' ? tx.fromAddress : tx.toAddress;
    if (otherAddress === centralAddress || otherAddress === 'Unknown') continue;

    const existing = addressMap.get(otherAddress);
    if (existing) {
      existing.count += 1;
      existing.amount += BigInt(tx.amount);
    } else {
      addressMap.set(otherAddress, {
        count: 1,
        amount: BigInt(tx.amount),
        type: tx.type,
      });
    }
  }

  // Calculate total incoming and outgoing
  const totalIncoming = filteredTransactions
    .filter((tx) => tx.type === 'incoming')
    .reduce((sum, tx) => sum + BigInt(tx.amount), BigInt(0));
  const totalOutgoing = filteredTransactions
    .filter((tx) => tx.type === 'outgoing')
    .reduce((sum, tx) => sum + BigInt(tx.amount), BigInt(0));

  // Create central address node
  const centralNodeData: CentralAddressNodeData = {
    label: shortenAddress(centralAddress),
    fullLabel: centralAddress,
    address: centralAddress,
    balance,
    transactionCount: filteredTransactions.length,
    totalIncoming: totalIncoming.toString(),
    totalOutgoing: totalOutgoing.toString(),
  };

  nodes.push({
    id: `central-${centralAddress}`,
    type: NodeType.CENTRAL_ADDRESS,
    data: centralNodeData,
    position: { x: 0, y: 0 },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  });

  // Create transaction and connected address nodes
  for (const tx of filteredTransactions) {
    // Check for self-transfer (same address sends to itself)
    const isSelfTransfer = tx.fromAddress === centralAddress && tx.toAddress === centralAddress;
    
    const otherAddress = tx.type === 'incoming' ? tx.fromAddress : tx.toAddress;
    
    if (otherAddress === 'Unknown' && !isSelfTransfer) continue;

    // Create transaction node
    const txNodeData: TransactionNodeData = {
      label: isSelfTransfer 
        ? `${(Number(tx.amount) / 1e18).toFixed(2)} ALPH (Self)` 
        : `${(Number(tx.amount) / 1e18).toFixed(2)} ALPH`,
      hash: tx.hash,
      timestamp: tx.timestamp,
      amount: tx.amount,
      fromAddress: tx.fromAddress,
      toAddress: tx.toAddress,
      confirmations: tx.confirmations,
      fee: tx.fee,
      type: isSelfTransfer ? 'self' : tx.type,
      isSelfTransfer,
    };

    const txNodeId = `tx-${tx.hash}`;
    const nodeType = isSelfTransfer 
      ? NodeType.SELF_TRANSACTION
      : (tx.type === 'incoming' ? NodeType.INCOMING_TRANSACTION : NodeType.OUTGOING_TRANSACTION);
    
    nodes.push({
      id: txNodeId,
      type: nodeType,
      data: txNodeData,
      position: { x: 0, y: 0 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    });

    // Skip creating connected address node for self-transfers
    if (isSelfTransfer) {
      // Create a self-loop edge for self-transfer
      const amountInAlph = Number(tx.amount) / 1e18;
      const humanizedAmount = formatNumberWithSuffix(amountInAlph, 2);
      
      edges.push({
        id: `edge-self-${txNodeId}`,
        source: `central-${centralAddress}`,
        target: txNodeId,
        animated: false,
        data: {
          amount: tx.amount,
          label: `${humanizedAmount} ALPH`,
          type: 'self' as any,
        },
        style: { stroke: 'rgba(156, 39, 176, 0.5)', strokeWidth: 2, strokeDasharray: '5,5' },
      } as CustomEdge);
      
      edges.push({
        id: `edge-${txNodeId}-self`,
        source: txNodeId,
        target: `central-${centralAddress}`,
        animated: false,
        data: {
          amount: tx.amount,
          label: '',
          type: 'self' as any,
        },
        style: { stroke: 'rgba(156, 39, 176, 0.5)', strokeWidth: 2, strokeDasharray: '5,5' },
      } as CustomEdge);
      
      continue; // Skip to next transaction
    }
    
    // Create or get connected address node
    const addressNodeId = `addr-${otherAddress}`;
    const existingNode = nodes.find((n) => n.id === addressNodeId);
    
    if (!existingNode) {
      const addressInfo = addressMap.get(otherAddress);
      
      // Skip if address info is not found (shouldn't happen, but safety check)
      if (!addressInfo) {
        console.warn(`Address info not found for: ${otherAddress}`);
        continue;
      }
      
      // Check if it's a contract address
      const isContract = alephiumService.isContractAddress(otherAddress);
      contractStatusMap.set(otherAddress, isContract);
      
      const connectedNodeData: ConnectedAddressNodeData = {
        label: shortenAddress(otherAddress),
        fullLabel: otherAddress,
        address: otherAddress,
        transactionCount: addressInfo.count,
        totalAmount: addressInfo.amount.toString(),
        isContract,
      };

      nodes.push({
        id: addressNodeId,
        type: NodeType.CONNECTED_ADDRESS,
        data: connectedNodeData,
        position: { x: 0, y: 0 },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      });
    }

    // Create edges
    const amountInAlph = Number(tx.amount) / 1e18;
    const humanizedAmount = formatNumberWithSuffix(amountInAlph, 2);
    
    if (tx.type === 'incoming') {
      // From connected address -> transaction -> central address
      edges.push({
        id: `edge-${addressNodeId}-${txNodeId}`,
        source: addressNodeId,
        target: txNodeId,
        animated: false,
        data: {
          amount: tx.amount,
          label: `${humanizedAmount} ALPH${tx.isDappInteraction ? ' (dApp)' : ''}`,
          type: 'incoming' as const,
          hash: tx.hash,
        },
        style: { stroke: '#4caf50', strokeWidth: 2 },
      } as CustomEdge);

      edges.push({
        id: `edge-${txNodeId}-central`,
        source: txNodeId,
        target: `central-${centralAddress}`,
        animated: false,
        data: {
          amount: tx.amount,
          label: '',
          type: 'incoming' as const,
          hash: tx.hash,
        },
        style: { stroke: '#4caf50', strokeWidth: 2 },
      } as CustomEdge);
    } else {
      // From central address -> transaction -> connected address
      edges.push({
        id: `edge-central-${txNodeId}`,
        source: `central-${centralAddress}`,
        target: txNodeId,
        animated: false,
        data: {
          amount: tx.amount,
          label: '',
          type: 'outgoing' as const,
          hash: tx.hash,
        },
        style: { stroke: '#ff9800', strokeWidth: 2 },
      } as CustomEdge);

      edges.push({
        id: `edge-${txNodeId}-${addressNodeId}`,
        source: txNodeId,
        target: addressNodeId,
        animated: false,
        data: {
          amount: tx.amount,
          label: `${humanizedAmount} ALPH${tx.isDappInteraction ? ' (dApp)' : ''}`,
          type: 'outgoing' as const,
          hash: tx.hash,
        },
        style: { stroke: '#ff9800', strokeWidth: 2 },
      } as CustomEdge);
    }
  }

  return { nodes, edges };
};

export const applyDagreLayout = (
  nodes: CustomNode[],
  edges: CustomEdge[],
  direction: 'LR' | 'TB' = 'LR'
): CustomNode[] => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction, nodesep: 100, ranksep: 200 });

  // Add nodes to dagre graph
  nodes.forEach((node) => {
    const isTransaction = 
      node.type === NodeType.INCOMING_TRANSACTION || 
      node.type === NodeType.OUTGOING_TRANSACTION;
    
    dagreGraph.setNode(node.id, {
      width: isTransaction ? TRANSACTION_NODE_WIDTH : NODE_WIDTH,
      height: isTransaction ? TRANSACTION_NODE_HEIGHT : NODE_HEIGHT,
    });
  });

  // Add edges to dagre graph
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Calculate layout
  dagre.layout(dagreGraph);

  // Apply positions to nodes
  return nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const isTransaction = 
      node.type === NodeType.INCOMING_TRANSACTION || 
      node.type === NodeType.OUTGOING_TRANSACTION;
    
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - (isTransaction ? TRANSACTION_NODE_WIDTH : NODE_WIDTH) / 2,
        y: nodeWithPosition.y - (isTransaction ? TRANSACTION_NODE_HEIGHT : NODE_HEIGHT) / 2,
      },
    };
  });
};

const shortenAddress = (address: string, chars: number = 6): string => {
  if (!address) return '';
  if (address.length <= chars * 2 + 3) return address;
  return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`;
};

const formatNumberWithSuffix = (num: number, decimals: number = 2): string => {
  if (num === 0) return '0';
  
  const absNum = Math.abs(num);
  
  if (absNum >= 1e9) {
    return (num / 1e9).toFixed(decimals) + 'B';
  }
  if (absNum >= 1e6) {
    return (num / 1e6).toFixed(decimals) + 'M';
  }
  if (absNum >= 1e3) {
    return (num / 1e3).toFixed(decimals) + 'K';
  }
  
  return num.toFixed(decimals);
};

