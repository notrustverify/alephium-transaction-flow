import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Box, Paper, Typography, Tooltip } from '@mui/material';
import { AccountBalance } from '@mui/icons-material';
import { CentralAddressNodeData } from '../../types';
import { formatAlphAmount } from '../../utils';

const CentralAddressNode: React.FC<NodeProps<CentralAddressNodeData>> = ({ data }) => {
  return (
    <Paper
      elevation={6}
      sx={{
        padding: 2,
        minWidth: 200,
        backgroundColor: 'primary.main',
        color: 'primary.contrastText',
        border: '3px solid',
        borderColor: 'primary.dark',
        borderRadius: 2,
      }}
    >
      <Handle type="target" position={Position.Left} />
      
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <AccountBalance fontSize="small" />
        <Typography variant="subtitle2" fontWeight="bold">
          Central Address
        </Typography>
      </Box>
      
      <Tooltip title={data.fullLabel || data.address} arrow>
        <Typography variant="body2" sx={{ mb: 1, fontFamily: 'monospace' }}>
          {data.label}
        </Typography>
      </Tooltip>
      
      <Box sx={{ fontSize: '0.75rem' }}>
        <Typography variant="caption" display="block">
          Balance: {formatAlphAmount(data.balance, 2)} ALPH
        </Typography>
        <Typography variant="caption" display="block">
          Transactions: {data.transactionCount}
        </Typography>
      </Box>
      
      <Handle type="source" position={Position.Right} />
    </Paper>
  );
};

export default memo(CentralAddressNode);

