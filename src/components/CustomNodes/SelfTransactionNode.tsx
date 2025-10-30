import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Box, Paper, Typography, Chip } from '@mui/material';
import { Autorenew } from '@mui/icons-material';
import { TransactionNodeData } from '../../types';
import { formatRelativeTime, formatTransactionHash } from '../../utils';

interface SelfTransactionNodeProps extends NodeProps<TransactionNodeData> {}

const SelfTransactionNode: React.FC<SelfTransactionNodeProps> = ({ data }) => {
  return (
    <Paper
      elevation={4}
      sx={{
        padding: 1.5,
        minWidth: 180,
        maxWidth: 200,
        backgroundColor: 'rgba(156, 39, 176, 0.15)',
        border: '2px solid',
        borderColor: 'rgba(156, 39, 176, 0.5)',
        borderRadius: 2,
        position: 'relative',
      }}
    >
      <Handle type="target" position={Position.Left} />
      
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
        <Chip
          icon={<Autorenew />}
          label="Self Transfer"
          size="small"
          color="secondary"
          sx={{ fontSize: '0.65rem', height: 20 }}
        />
      </Box>
      
      <Typography
        variant="body2"
        fontWeight="bold"
        sx={{ mb: 0.5, color: 'secondary.dark' }}
      >
        {data.label}
      </Typography>
      
      <Typography
        variant="caption"
        display="block"
        sx={{ mb: 0.5, fontFamily: 'monospace', fontSize: '0.65rem' }}
        title={data.hash}
      >
        {formatTransactionHash(data.hash, 6)}
      </Typography>
      
      <Typography variant="caption" display="block" color="text.secondary" fontSize="0.65rem">
        {formatRelativeTime(data.timestamp)}
      </Typography>
      
      <Handle type="source" position={Position.Right} />
    </Paper>
  );
};

export default memo(SelfTransactionNode);

