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

  // Example addresses removed

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

            {/* Depth control temporarily removed */}

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

