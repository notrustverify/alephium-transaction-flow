import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  FormControlLabel,
  Switch,
  Chip,
} from '@mui/material';
import {
  Search,
  Clear,
  ExpandMore,
  TuneOutlined,
} from '@mui/icons-material';
import { validateAlephiumAddress } from '../../utils';
import { useAppContext } from '../../context/AppContext';

interface AddressInputProps {
  onSearch: (address: string) => void;
  loading?: boolean;
  error?: string | null;
}

const EXAMPLE_ADDRESSES = [
  '1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH',
  '1C2RAVWSuaXw8xtUxqVERR7ChKBE1XgscNFw73NSHE1v3',
];

const AddressInput: React.FC<AddressInputProps> = ({ onSearch, loading = false, error = null }) => {
  const { filters, setFilters } = useAppContext();
  const [address, setAddress] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const handleAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setAddress(value);
    setValidationError(null);
  };

  const handleSearch = () => {
    if (!address.trim()) {
      setValidationError('Please enter an address');
      return;
    }

    if (!validateAlephiumAddress(address.trim())) {
      setValidationError('Invalid Alephium address format');
      return;
    }

    setValidationError(null);
    onSearch(address.trim());
  };

  const handleClear = () => {
    setAddress('');
    setValidationError(null);
  };

  const handleExampleClick = (exampleAddress: string) => {
    setAddress(exampleAddress);
    setValidationError(null);
    onSearch(exampleAddress);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Search Address
      </Typography>

      <Box display="flex" gap={2} mb={2}>
        <TextField
          fullWidth
          label="Alephium Address"
          placeholder="Enter an Alephium address..."
          value={address}
          onChange={handleAddressChange}
          onKeyPress={handleKeyPress}
          error={!!validationError}
          helperText={validationError}
          disabled={loading}
          size="medium"
          InputProps={{
            endAdornment: address && (
              <Clear
                sx={{ cursor: 'pointer' }}
                onClick={handleClear}
                fontSize="small"
              />
            ),
          }}
        />
        <Button
          variant="contained"
          size="large"
          onClick={handleSearch}
          disabled={loading || !address.trim()}
          startIcon={loading ? <CircularProgress size={20} /> : <Search />}
          sx={{ minWidth: 120 }}
        >
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box display="flex" gap={1} mb={2} flexWrap="wrap">
        <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
          Try examples:
        </Typography>
        {EXAMPLE_ADDRESSES.map((exampleAddr, index) => (
          <Chip
            key={index}
            label={`${exampleAddr.substring(0, 8)}...${exampleAddr.substring(exampleAddr.length - 6)}`}
            size="small"
            onClick={() => handleExampleClick(exampleAddr)}
            disabled={loading}
            sx={{ cursor: 'pointer' }}
          />
        ))}
      </Box>

      <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box display="flex" alignItems="center" gap={1}>
            <TuneOutlined fontSize="small" />
            <Typography variant="subtitle2">Advanced Options</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box display="flex" flexDirection="column" gap={3}>
            <Box>
              <Typography variant="body2" gutterBottom>
                Transaction Limit: {filters.transactionLimit}
              </Typography>
              <Slider
                value={filters.transactionLimit}
                onChange={(_, value) =>
                  setFilters({ ...filters, transactionLimit: value as number })
                }
                min={10}
                max={200}
                step={10}
                marks={[
                  { value: 10, label: '10' },
                  { value: 50, label: '50' },
                  { value: 100, label: '100' },
                  { value: 200, label: '200' },
                ]}
                disabled={loading}
              />
            </Box>

            <Box>
              <Typography variant="body2" gutterBottom>
                Maximum Depth: {filters.maxDepth}
              </Typography>
              <Slider
                value={filters.maxDepth}
                onChange={(_, value) =>
                  setFilters({ ...filters, maxDepth: value as number })
                }
                min={1}
                max={5}
                step={1}
                marks
                disabled={loading}
              />
            </Box>

            <Box display="flex" gap={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.showIncoming}
                    onChange={(e) =>
                      setFilters({ ...filters, showIncoming: e.target.checked })
                    }
                    disabled={loading}
                  />
                }
                label="Show Incoming"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.showOutgoing}
                    onChange={(e) =>
                      setFilters({ ...filters, showOutgoing: e.target.checked })
                    }
                    disabled={loading}
                  />
                }
                label="Show Outgoing"
              />
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
};

export default AddressInput;

