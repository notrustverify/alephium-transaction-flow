import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactFlow, {
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  NodeMouseHandler,
  EdgeMouseHandler,
  BackgroundVariant,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Box, IconButton, Tooltip, Paper, Typography, Switch, FormControlLabel } from '@mui/material';
import {
  CenterFocusStrong,
  Refresh,
  Fullscreen,
  FullscreenExit,
} from '@mui/icons-material';
import {
  CentralAddressNode,
  ConnectedAddressNode,
  TransactionNode,
  SelfTransactionNode,
} from '../CustomNodes';
import { CustomEdge } from '../CustomEdges';
import { NodeType, CustomNode } from '../../types';

const nodeTypes = {
  [NodeType.CENTRAL_ADDRESS]: CentralAddressNode,
  [NodeType.CONNECTED_ADDRESS]: ConnectedAddressNode,
  [NodeType.INCOMING_TRANSACTION]: TransactionNode,
  [NodeType.OUTGOING_TRANSACTION]: TransactionNode,
  [NodeType.SELF_TRANSACTION]: SelfTransactionNode,
};

const edgeTypes = {
  default: CustomEdge,
};

interface FlowVisualizationProps {
  nodes: CustomNode[];
  edges: Edge[];
  onNodeClick?: (node: CustomNode) => void;
  onNodeDoubleClick?: (node: CustomNode) => void;
  onEdgeClick?: (edge: Edge) => void;
  onRefresh?: () => void;
  loading?: boolean;
  showLegend?: boolean;
  onToggleLegend?: () => void;
}

const FlowVisualization: React.FC<FlowVisualizationProps> = ({
  nodes: initialNodes,
  edges: initialEdges,
  onNodeClick,
  onNodeDoubleClick,
  onEdgeClick,
  onRefresh,
  loading = false,
  showLegend = false,
  onToggleLegend,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [showSelfTransactions, setShowSelfTransactions] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleToggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const filterHiddenNodesAndEdges = useCallback(
    (nodesToFilter: CustomNode[], edgesToFilter: Edge[]) => {
      // Keep only non-transaction nodes
      const filteredNodes = nodesToFilter.filter((n) => {
        if (n.type === NodeType.INCOMING_TRANSACTION) return false;
        if (n.type === NodeType.OUTGOING_TRANSACTION) return false;
        if (!showSelfTransactions && n.type === NodeType.SELF_TRANSACTION) return false;
        return true;
      });

      const keptNodeIds = new Set(filteredNodes.map((n) => n.id));
      const removedNodeIds = new Set(
        nodesToFilter
          .filter((n) => {
            if (n.type === NodeType.INCOMING_TRANSACTION) return true;
            if (n.type === NodeType.OUTGOING_TRANSACTION) return true;
            if (!showSelfTransactions && n.type === NodeType.SELF_TRANSACTION) return true;
            return false;
          })
          .map((n) => n.id)
      );

      // Start with edges that already connect kept nodes
      const passthroughEdges: Edge[] = edgesToFilter.filter(
        (e) => keptNodeIds.has(e.source) && keptNodeIds.has(e.target)
      );

      // Build maps to rewire edges through removed nodes
      const incomingToRemoved: Record<string, Edge[]> = {};
      const outgoingFromRemoved: Record<string, Edge[]> = {};

      for (const e of edgesToFilter) {
        const sourceRemoved = removedNodeIds.has(e.source);
        const targetRemoved = removedNodeIds.has(e.target);

        if (!sourceRemoved && targetRemoved) {
          // Edge from kept node into a removed node
          if (!incomingToRemoved[e.target]) incomingToRemoved[e.target] = [];
          incomingToRemoved[e.target].push(e);
        } else if (sourceRemoved && !targetRemoved) {
          // Edge from removed node out to a kept node
          if (!outgoingFromRemoved[e.source]) outgoingFromRemoved[e.source] = [];
          outgoingFromRemoved[e.source].push(e);
        }
      }

      // For each removed node, connect all kept sources to all kept targets
      const rewiredEdges: Edge[] = [];
      for (const removedId of removedNodeIds) {
        const inEdges = incomingToRemoved[removedId] || [];
        const outEdges = outgoingFromRemoved[removedId] || [];

        for (const inEdge of inEdges) {
          for (const outEdge of outEdges) {
            // Connect original source to original target
            const newSource = inEdge.source;
            const newTarget = outEdge.target;
            if (!keptNodeIds.has(newSource) || !keptNodeIds.has(newTarget)) {
              continue;
            }

            // Carry over basic edge data when available
            const label = (outEdge as any).data?.label ?? (inEdge as any).data?.label ?? '';
            const amount = (outEdge as any).data?.amount ?? (inEdge as any).data?.amount ?? '';
            const type = (outEdge as any).data?.type ?? (inEdge as any).data?.type;

            const id = `${newSource}->${newTarget}::via::${removedId}::${label || amount}`;
            rewiredEdges.push({
              id,
              source: newSource,
              target: newTarget,
              type: 'default',
              data: type
                ? { label, amount, type } as any
                : ({ label, amount } as any),
            });
          }
        }
      }

      // Merge and deduplicate by id to avoid duplicates
      const allEdges = [...passthroughEdges, ...rewiredEdges];
      const dedupedMap = new Map<string, Edge>();
      for (const e of allEdges) {
        dedupedMap.set(e.id, e);
      }
      const filteredEdges = Array.from(dedupedMap.values());

      return { filteredNodes, filteredEdges };
    },
    [showSelfTransactions]
  );

  // Update nodes and edges when props change
  React.useEffect(() => {
    const { filteredNodes, filteredEdges } = filterHiddenNodesAndEdges(
      initialNodes,
      initialEdges
    );
    setNodes(filteredNodes);
    setEdges(filteredEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges, filterHiddenNodesAndEdges, showSelfTransactions]);

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_, node) => {
      if (onNodeClick) {
        onNodeClick(node as CustomNode);
      }
    },
    [onNodeClick]
  );

  const handleNodeDoubleClick: NodeMouseHandler = useCallback(
    (_, node) => {
      if (onNodeDoubleClick) {
        onNodeDoubleClick(node as CustomNode);
      }
    },
    [onNodeDoubleClick]
  );

  const handleEdgeClick: EdgeMouseHandler = useCallback(
    (_, edge) => {
      if (onEdgeClick) {
        onEdgeClick(edge);
      }
    },
    [onEdgeClick]
  );

  const handleFitView = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.2, duration: 500 });
    }
  }, [reactFlowInstance]);

  const handleRefresh = useCallback(() => {
    if (onRefresh) {
      onRefresh();
    }
  }, [onRefresh]);

  if (nodes.length === 0) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'background.default',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            textAlign: 'center',
            maxWidth: 500,
          }}
        >
          <Typography variant="h5" gutterBottom>
            Welcome to Alephium Transaction Flow Visualizer
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Enter an Alephium address above to visualize its transaction flow.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You'll see:
          </Typography>
          <Box component="ul" sx={{ textAlign: 'left', mt: 2 }}>
            <li>
              <Typography variant="body2">
                Incoming and outgoing transactions
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                Connected addresses and their relationships
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                Transaction amounts and timestamps
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                Interactive graph with detailed information
              </Typography>
            </li>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box ref={containerRef} sx={{ height: '100%', width: '100%', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={handleNodeDoubleClick}
        onEdgeClick={handleEdgeClick}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        attributionPosition="bottom-left"
        minZoom={0.1}
        maxZoom={2}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            switch (node.type) {
              case NodeType.CENTRAL_ADDRESS:
                return '#1976d2';
              case NodeType.CONNECTED_ADDRESS:
                return '#9e9e9e';
              case NodeType.INCOMING_TRANSACTION:
                return '#4caf50';
              case NodeType.OUTGOING_TRANSACTION:
                return '#ff9800';
              case NodeType.SELF_TRANSACTION:
                return '#9c27b0';
              default:
                return '#999';
            }
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />

        <Panel position="top-right">
          <Paper
            elevation={3}
            sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <Tooltip title="Fit View" arrow>
              <IconButton onClick={handleFitView} size="small">
                <CenterFocusStrong />
              </IconButton>
            </Tooltip>

            <Tooltip title="Refresh Data" arrow>
              <IconButton onClick={handleRefresh} size="small" disabled={loading}>
                <Refresh />
              </IconButton>
            </Tooltip>

            <FormControlLabel
              sx={{ ml: 0.5 }}
              control={
                <Switch
                  size="small"
                  checked={showSelfTransactions}
                  onChange={(e) => setShowSelfTransactions(e.target.checked)}
                />
              }
              label={<Typography variant="caption">Show self transfers</Typography>}
            />

            <FormControlLabel
              sx={{ ml: 0.5 }}
              control={
                <Switch
                  size="small"
                  checked={!!showLegend}
                  onChange={() => onToggleLegend && onToggleLegend()}
                />
              }
              label={<Typography variant="caption">Legend</Typography>}
            />

            <Tooltip title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'} arrow>
              <IconButton onClick={handleToggleFullscreen} size="small">
                {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
              </IconButton>
            </Tooltip>
          </Paper>
        </Panel>
      </ReactFlow>
    </Box>
  );
};

export default FlowVisualization;

