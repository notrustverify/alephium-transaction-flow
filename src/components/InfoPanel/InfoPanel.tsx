import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Button,
  Chip,
  Stack,
} from '@mui/material';
import {
  Close,
  ContentCopy,
  OpenInNew,
  Explore,
} from '@mui/icons-material';
import {
  CustomNode,
  NodeType,
  TransactionNodeData,
  CentralAddressNodeData,
  ConnectedAddressNodeData,
} from '../../types';
import {
  formatAlphAmount,
  formatTimestamp,
  formatRelativeTime,
  copyToClipboard,
  getExplorerUrl,
  getAddressExplorerUrl,
} from '../../utils';
import { useAppContext } from '../../context/AppContext';

interface InfoPanelProps {
  open: boolean;
  onClose: () => void;
  selectedNode: CustomNode | null;
  onExploreAddress?: (address: string) => void;
}

const InfoPanel: React.FC<InfoPanelProps> = ({
  open,
  onClose,
  selectedNode,
  onExploreAddress,
}) => {
  const { network } = useAppContext();
  const [copySuccess, setCopySuccess] = React.useState(false);

  const handleCopy = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const renderNodeDetails = () => {
    if (!selectedNode) {
      return (
        <Box p={2}>
          <Typography variant="body2" color="text.secondary">
            Click on a node to view details
          </Typography>
        </Box>
      );
    }

    if (
      selectedNode.type === NodeType.CENTRAL_ADDRESS ||
      selectedNode.type === NodeType.CONNECTED_ADDRESS
    ) {
      const data = selectedNode.data as CentralAddressNodeData | ConnectedAddressNodeData;
      const isCentral = selectedNode.type === NodeType.CENTRAL_ADDRESS;

      return (
        <Box>
          <Box p={2}>
            <Chip
              label={isCentral ? 'Central Address' : 'Connected Address'}
              color={isCentral ? 'primary' : 'default'}
              size="small"
              sx={{ mb: 2 }}
            />

            <Typography variant="subtitle2" gutterBottom>
              Address
            </Typography>
            <Box
              display="flex"
              alignItems="center"
              gap={1}
              mb={2}
              sx={{
                backgroundColor: 'grey.100',
                p: 1,
                borderRadius: 1,
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                wordBreak: 'break-all',
              }}
            >
              <Typography variant="caption" sx={{ flex: 1 }}>
                {data.address}
              </Typography>
              <IconButton size="small" onClick={() => handleCopy(data.address || '')}>
                <ContentCopy fontSize="small" />
              </IconButton>
            </Box>

            {copySuccess && (
              <Typography variant="caption" color="success.main" display="block" mb={1}>
                Copied to clipboard!
              </Typography>
            )}

            <Stack spacing={1.5} divider={<Divider />}>
              {isCentral && (
                <>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Balance
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {formatAlphAmount((data as CentralAddressNodeData).balance, 4)} ALPH
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Total Incoming
                    </Typography>
                    <Typography variant="body2" color="success.main" fontWeight="bold">
                      {formatAlphAmount((data as CentralAddressNodeData).totalIncoming, 4)}{' '}
                      ALPH
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Total Outgoing
                    </Typography>
                    <Typography variant="body2" color="warning.main" fontWeight="bold">
                      {formatAlphAmount((data as CentralAddressNodeData).totalOutgoing, 4)}{' '}
                      ALPH
                    </Typography>
                  </Box>
                </>
              )}

              {!isCentral && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total Amount
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {formatAlphAmount((data as ConnectedAddressNodeData).totalAmount, 4)}{' '}
                    ALPH
                  </Typography>
                </Box>
              )}

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Transactions
                </Typography>
                <Typography variant="body2">
                  {isCentral
                    ? (data as CentralAddressNodeData).transactionCount
                    : (data as ConnectedAddressNodeData).transactionCount}
                </Typography>
              </Box>
            </Stack>

            <Box mt={3} display="flex" flexDirection="column" gap={1}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<OpenInNew />}
                onClick={() =>
                  window.open(getAddressExplorerUrl(data.address || '', network), '_blank')
                }
                fullWidth
              >
                View in Explorer
              </Button>
              {!isCentral && onExploreAddress && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Explore />}
                  onClick={() => onExploreAddress(data.address || '')}
                  fullWidth
                >
                  Explore This Address
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      );
    }

    if (
      selectedNode.type === NodeType.INCOMING_TRANSACTION ||
      selectedNode.type === NodeType.OUTGOING_TRANSACTION
    ) {
      const data = selectedNode.data as TransactionNodeData;
      const isIncoming = data.type === 'incoming';

      return (
        <Box>
          <Box p={2}>
            <Chip
              label={isIncoming ? 'Incoming Transaction' : 'Outgoing Transaction'}
              color={isIncoming ? 'success' : 'warning'}
              size="small"
              sx={{ mb: 2 }}
            />

            <Typography variant="subtitle2" gutterBottom>
              Transaction Hash
            </Typography>
            <Box
              display="flex"
              alignItems="center"
              gap={1}
              mb={2}
              sx={{
                backgroundColor: 'grey.100',
                p: 1,
                borderRadius: 1,
                fontFamily: 'monospace',
                fontSize: '0.7rem',
                wordBreak: 'break-all',
              }}
            >
              <Typography variant="caption" sx={{ flex: 1 }}>
                {data.hash}
              </Typography>
              <IconButton size="small" onClick={() => handleCopy(data.hash)}>
                <ContentCopy fontSize="small" />
              </IconButton>
            </Box>

            {copySuccess && (
              <Typography variant="caption" color="success.main" display="block" mb={1}>
                Copied to clipboard!
              </Typography>
            )}

            <Stack spacing={1.5} divider={<Divider />}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Amount
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  color={isIncoming ? 'success.main' : 'warning.main'}
                >
                  {formatAlphAmount(data.amount, 4)} ALPH
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  From Address
                </Typography>
                <Typography
                  variant="caption"
                  display="block"
                  sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}
                >
                  {data.fromAddress}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  To Address
                </Typography>
                <Typography
                  variant="caption"
                  display="block"
                  sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}
                >
                  {data.toAddress}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Timestamp
                </Typography>
                <Typography variant="body2">{formatTimestamp(data.timestamp)}</Typography>
                <Typography variant="caption" color="text.secondary">
                  ({formatRelativeTime(data.timestamp)})
                </Typography>
              </Box>

              {data.confirmations !== undefined && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Confirmations
                  </Typography>
                  <Typography variant="body2">{data.confirmations}</Typography>
                </Box>
              )}

              {data.fee && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Fee
                  </Typography>
                  <Typography variant="body2">
                    {formatAlphAmount(data.fee, 6)} ALPH
                  </Typography>
                </Box>
              )}
            </Stack>

            <Box mt={3}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<OpenInNew />}
                onClick={() => window.open(getExplorerUrl(data.hash, network), '_blank')}
                fullWidth
              >
                View in Explorer
              </Button>
            </Box>
          </Box>
        </Box>
      );
    }

    return null;
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 350, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          p={2}
          borderBottom={1}
          borderColor="divider"
        >
          <Typography variant="h6">Details</Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto' }}>{renderNodeDetails()}</Box>
      </Box>
    </Drawer>
  );
};

export default InfoPanel;

