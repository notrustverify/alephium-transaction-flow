import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Box, Paper, Typography, Tooltip } from '@mui/material';
import { AccountBalanceWallet, Code } from '@mui/icons-material';
import { ConnectedAddressNodeData } from '../../types';
import { formatAlphAmount } from '../../utils';

const ConnectedAddressNode: React.FC<NodeProps<ConnectedAddressNodeData>> = ({ data }) => {
  const isContract = data.isContract || false;
  
  return (
    <Paper
      elevation={3}
      sx={{
        padding: 1.5,
        minWidth: 160,
        backgroundColor: isContract ? 'secondary.50' : 'background.paper',
        border: '2px solid',
        borderColor: isContract ? 'secondary.main' : 'grey.400',
        borderRadius: 2,
        '&:hover': {
          borderColor: isContract ? 'secondary.dark' : 'secondary.main',
          elevation: 6,
        },
      }}
    >
      <Handle type="target" position={Position.Left} />
      
      <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
        {isContract ? (
          <Code fontSize="small" color="secondary" />
        ) : (
          <AccountBalanceWallet fontSize="small" color="action" />
        )}
        <Typography variant="caption" fontWeight="bold">
          {isContract ? 'Smart Contract' : 'Address'}
        </Typography>
      </Box>
      
      <Tooltip title={data.fullLabel || data.address} arrow>
        <Typography
          variant="body2"
          sx={{ mb: 0.5, fontFamily: 'monospace', fontSize: '0.75rem' }}
        >
          {data.label}
        </Typography>
      </Tooltip>
      
      <Box sx={{ fontSize: '0.7rem' }}>
        <Typography variant="caption" display="block" color="text.secondary">
          {formatAlphAmount(data.totalAmount, 2)} ALPH
        </Typography>
        <Typography variant="caption" display="block" color="text.secondary">
          {data.transactionCount} tx
        </Typography>
      </Box>
      
      <Handle type="source" position={Position.Right} />
    </Paper>
  );
};

export default memo(ConnectedAddressNode);

