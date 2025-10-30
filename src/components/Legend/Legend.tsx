import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Divider,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  AccountBalance,
  AccountBalanceWallet,
  CallMade,
  CallReceived,
  Autorenew,
  Close,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';

interface LegendProps {
  onClose?: () => void;
}

const Legend: React.FC<LegendProps> = ({ onClose }) => {
  const [expanded, setExpanded] = React.useState(true);

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        position: 'absolute',
        bottom: 20,
        right: 20,
        minWidth: 250,
        zIndex: 10,
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="subtitle2" fontWeight="bold">
          Legend
        </Typography>
        <Box>
          <IconButton size="small" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
          {onClose && (
            <IconButton size="small" onClick={onClose}>
              <Close />
            </IconButton>
          )}
        </Box>
      </Box>

      <Collapse in={expanded}>
        <Stack spacing={1.5} divider={<Divider />}>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
              Node Types
            </Typography>
            <Stack spacing={1}>
              <Box display="flex" alignItems="center" gap={1}>
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    backgroundColor: 'primary.main',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AccountBalance sx={{ color: 'white', fontSize: 18 }} />
                </Box>
                <Typography variant="caption">Central Address</Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1}>
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    backgroundColor: 'background.paper',
                    border: '2px solid',
                    borderColor: 'grey.400',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AccountBalanceWallet sx={{ fontSize: 18 }} />
                </Box>
                <Typography variant="caption">Connected Address</Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1}>
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    backgroundColor: 'success.light',
                    border: '2px solid',
                    borderColor: 'success.main',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CallReceived sx={{ fontSize: 18 }} />
                </Box>
                <Typography variant="caption">Incoming Transaction</Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1}>
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    backgroundColor: 'warning.light',
                    border: '2px solid',
                    borderColor: 'warning.main',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CallMade sx={{ fontSize: 18 }} />
                </Box>
                <Typography variant="caption">Outgoing Transaction</Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1}>
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    backgroundColor: 'secondary.light',
                    border: '2px solid',
                    borderColor: 'secondary.main',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Autorenew sx={{ fontSize: 18 }} />
                </Box>
                <Typography variant="caption">Self Transfer</Typography>
              </Box>
            </Stack>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
              Edge Types
            </Typography>
            <Stack spacing={1}>
              <Box display="flex" alignItems="center" gap={1}>
                <Box
                  sx={{
                    width: 30,
                    height: 2,
                    backgroundColor: 'success.main',
                  }}
                />
                <Typography variant="caption">Incoming Flow</Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1}>
                <Box
                  sx={{
                    width: 30,
                    height: 2,
                    backgroundColor: 'warning.main',
                  }}
                />
                <Typography variant="caption">Outgoing Flow</Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1}>
                <Box
                  sx={{
                    width: 30,
                    height: 2,
                    backgroundColor: 'secondary.main',
                    borderTop: '2px dashed',
                    borderColor: 'secondary.main',
                  }}
                />
                <Typography variant="caption">Self Transfer (dashed)</Typography>
              </Box>
            </Stack>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
              Interactions
            </Typography>
            <Typography variant="caption" display="block" sx={{ fontSize: '0.65rem' }}>
              • Click node to view details
            </Typography>
            <Typography variant="caption" display="block" sx={{ fontSize: '0.65rem' }}>
              • Double-click address to explore
            </Typography>
            <Typography variant="caption" display="block" sx={{ fontSize: '0.65rem' }}>
              • Drag to reposition nodes
            </Typography>
          </Box>
        </Stack>
      </Collapse>
    </Paper>
  );
};

export default Legend;

