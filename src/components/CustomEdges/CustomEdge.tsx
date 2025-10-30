import React from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer } from 'reactflow';
import { CustomEdgeData } from '../../types';

const CustomEdge: React.FC<EdgeProps<CustomEdgeData>> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const getColor = () => {
    if (!data?.type) return '#666';
    if (data.type === 'incoming') return '#2e7d32';
    if (data.type === 'outgoing') return '#ed6c02';
    return 'rgba(156, 39, 176, 0.7)'; // self transfer
  };

  const color = getColor();
  const strokeDasharray = data?.type === 'outgoing' ? '6 3' : undefined;
  const strokeWidth = data?.type ? 2.25 : 1.75;

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        style={{
          ...style,
          cursor: 'pointer',
          stroke: color,
          strokeWidth,
          fill: 'none',
          strokeDasharray,
        }}
        markerEnd="url(#arrow)"
      />
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 11,
              fontWeight: 600,
              pointerEvents: 'all',
              color: getColor(),
              textShadow: '0px 0px 4px rgba(255,255,255,0.9), 0px 0px 8px rgba(255,255,255,0.9)',
              cursor: 'pointer',
            }}
            className="nodrag nopan"
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default CustomEdge;

