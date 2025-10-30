import React, { useState, useCallback } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box, Container, Snackbar, Alert } from '@mui/material';
import { ReactFlowProvider, Edge } from 'reactflow';
import { AppProvider, useAppContext } from './context/AppContext';
import AppBar from './components/AppBar';
import AddressInput from './components/AddressInput';
import FlowVisualization from './components/FlowVisualization';
import InfoPanel from './components/InfoPanel';
import Legend from './components/Legend';
import Statistics from './components/Statistics';
import { useTransactionFlow } from './hooks';
import { CustomNode, NodeType, CustomEdge } from './types';

const AppContent: React.FC = () => {
  const { darkMode, filters, setSelectedAddress } = useAppContext();
  const [selectedNode, setSelectedNode] = useState<CustomNode | null>(null);
  const [infoPanelOpen, setInfoPanelOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const {
    nodes,
    edges,
    loading,
    error,
    transactions,
    balance,
    fetchTransactionFlow,
    refreshData,
  } = useTransactionFlow();

  const [currentAddress, setCurrentAddress] = useState<string | null>(null);

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
          primary: {
            main: '#1976d2',
          },
          secondary: {
            main: '#dc004e',
          },
          success: {
            main: '#4caf50',
            light: '#e8f5e9',
          },
          warning: {
            main: '#ff9800',
            light: '#fff3e0',
          },
          error: {
            main: '#f44336',
          },
        },
        typography: {
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        },
      }),
    [darkMode]
  );

  const handleSearch = useCallback(
    async (address: string) => {
      setCurrentAddress(address);
      setSelectedAddress(address);
      await fetchTransactionFlow(address, filters);
    },
    [fetchTransactionFlow, filters, setSelectedAddress]
  );

  const handleNodeClick = useCallback((node: CustomNode) => {
    setSelectedNode(node);
    setInfoPanelOpen(true);
  }, []);

  const handleEdgeClick = useCallback((edge: Edge) => {
    // Extract transaction hash from edge ID (format: edge-{source}-{target} or edge-{txNodeId}-...)
    const txNodeId = edge.source.startsWith('tx-') ? edge.source : edge.target;
    
    // Find the transaction node
    const txNode = nodes.find(n => n.id === txNodeId);
    if (txNode) {
      setSelectedNode(txNode as CustomNode);
      setInfoPanelOpen(true);
    }
  }, [nodes]);

  const handleNodeDoubleClick = useCallback(
    async (node: CustomNode) => {
      if (
        node.type === NodeType.CENTRAL_ADDRESS ||
        node.type === NodeType.CONNECTED_ADDRESS
      ) {
        const address = node.data.address;
        if (address) {
          setSnackbar({
            open: true,
            message: `Exploring address: ${address.substring(0, 10)}...`,
            severity: 'info',
          });
          await handleSearch(address);
          setInfoPanelOpen(false);
        }
      }
    },
    [handleSearch]
  );

  const handleExploreAddress = useCallback(
    async (address: string) => {
      setInfoPanelOpen(false);
      await handleSearch(address);
    },
    [handleSearch]
  );

  const handleRefresh = useCallback(async () => {
    if (currentAddress) {
      setSnackbar({
        open: true,
        message: 'Refreshing data...',
        severity: 'info',
      });
      await refreshData();
      setSnackbar({
        open: true,
        message: 'Data refreshed successfully',
        severity: 'success',
      });
    }
  }, [currentAddress, refreshData]);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <AppBar />

        <Container maxWidth="xl" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', py: 3 }}>
          <AddressInput onSearch={handleSearch} loading={loading} error={error} />

          {transactions.length > 0 && currentAddress && (
            <Statistics transactions={transactions} balance={balance} address={currentAddress} />
          )}

          <Box sx={{ flexGrow: 1, position: 'relative', minHeight: 500 }}>
            <ReactFlowProvider>
              <FlowVisualization
                nodes={nodes}
                edges={edges}
                onNodeClick={handleNodeClick}
                onNodeDoubleClick={handleNodeDoubleClick}
                onEdgeClick={handleEdgeClick}
                onRefresh={handleRefresh}
                loading={loading}
              />
              {nodes.length > 0 && <Legend />}
            </ReactFlowProvider>
          </Box>
        </Container>

        <InfoPanel
          open={infoPanelOpen}
          onClose={() => setInfoPanelOpen(false)}
          selectedNode={selectedNode}
          onExploreAddress={handleExploreAddress}
        />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;

