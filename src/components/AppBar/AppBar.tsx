import React from 'react';
import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  Chip,
} from '@mui/material';
import {
  Brightness4,
  Brightness7,
  CheckCircle,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useAppContext } from '../../context/AppContext';
import { NetworkType } from '../../types';

const AppBar: React.FC = () => {
  const { network, setNetwork, darkMode, toggleDarkMode } = useAppContext();
  const [connected] = React.useState(true);

  return (
    <MuiAppBar position="static" elevation={2}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          Alephium Transaction Flow Visualizer
        </Typography>

        <Box display="flex" alignItems="center" gap={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={network}
              onChange={(e) => setNetwork(e.target.value as NetworkType)}
              sx={{
                color: 'white',
                '.MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '.MuiSvgIcon-root': {
                  color: 'white',
                },
              }}
            >
              <MenuItem value={NetworkType.MAINNET}>Mainnet</MenuItem>
              <MenuItem value={NetworkType.TESTNET}>Testnet</MenuItem>
              <MenuItem value={NetworkType.DEVNET}>Devnet</MenuItem>
            </Select>
          </FormControl>

          <Chip
            icon={connected ? <CheckCircle /> : <ErrorIcon />}
            label={connected ? 'Connected' : 'Disconnected'}
            color={connected ? 'success' : 'error'}
            size="small"
          />

          <IconButton color="inherit" onClick={toggleDarkMode}>
            {darkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Box>
      </Toolbar>
    </MuiAppBar>
  );
};

export default AppBar;

