import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Box, Paper, Typography, Tooltip } from '@mui/material';
import { TransactionNodeData } from '../../types';
import { formatRelativeTime, formatTransactionHash } from '../../utils';

interface TransactionNodeProps extends NodeProps<TransactionNodeData> {}

const TransactionNode: React.FC<TransactionNodeProps> = ({ data }) => {
  const isIncoming = data.type === 'incoming';
  
  return (
    <Paper
      elevation={4}
      sx={{
        padding: 1.5,
        minWidth: 180,
        maxWidth: 200,
        backgroundColor: isIncoming ? 'success.light' : 'warning.light',
        border: '2px solid',
        borderColor: isIncoming ? 'success.main' : 'warning.main',
        borderRadius: 2,
        position: 'relative',
      }}
    >
      <Handle type="target" position={Position.Left} />
      
      <Typography
        variant="body2"
        fontWeight="bold"
        sx={{ mb: 1, color: isIncoming ? 'success.dark' : 'warning.dark' }}
      >
        {data.label}
      </Typography>
      
      <Tooltip title={data.hash} arrow>
        <Typography
          variant="caption"
          display="block"
          sx={{ mb: 0.5, fontFamily: 'monospace', fontSize: '0.65rem' }}
        >
          {formatTransactionHash(data.hash, 6)}
        </Typography>
      </Tooltip>
      
      <Typography variant="caption" display="block" color="text.secondary" fontSize="0.65rem">
        {formatRelativeTime(data.timestamp)}
      </Typography>
      
      <Handle type="source" position={Position.Right} />
    </Paper>
  );
};

export default memo(TransactionNode);

