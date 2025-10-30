# Alephium Transaction Flow Visualizer

A web-based 2D transaction flow visualizer for the Alephium blockchain built with React, Material-UI, and React Flow. This application allows users to input an Alephium address and visualize the flow of transactions going in and out of that address.

## Features

### Core Functionality
- **Address Search**: Input any Alephium address to visualize its transaction flow
- **Interactive Graph Visualization**: React Flow-powered interactive graph showing:
  - Central address node (the queried address)
  - Connected address nodes (other addresses that transacted with the queried address)
  - Incoming transaction nodes (green)
  - Outgoing transaction nodes (orange)
  - Animated edges showing transaction flow
- **Real-time Data**: Fetches live data from the Alephium blockchain using `@alephium/web3`

### User Interface
- **Modern Material-UI Design**: Clean, responsive interface with light/dark mode support
- **Network Selector**: Switch between Mainnet, Testnet, and Devnet
- **Advanced Filters**:
  - Transaction limit control (10-200 transactions)
  - Maximum depth slider
  - Show/hide incoming and outgoing transactions
  - Minimum amount filter
- **Statistics Dashboard**: Shows balance, total incoming/outgoing amounts, and net flow
- **Interactive Nodes**:
  - Click to view detailed information
  - Double-click address nodes to explore that address
  - Hover for tooltips
- **Information Panel**: Detailed drawer showing transaction and address information
- **Legend**: Visual guide for node types and edge meanings
- **React Flow Controls**: Zoom, pan, fit view, and minimap

### Additional Features
- Example addresses for quick testing
- Copy addresses and transaction hashes to clipboard
- Open addresses and transactions in Alephium Explorer
- Loading states and error handling
- Responsive design for tablets and desktops

## Tech Stack

- **React 19** with TypeScript
- **Material-UI (MUI)** for UI components
- **React Flow** for graph visualization
- **@alephium/web3** for blockchain interaction
- **Vite** for fast development and building
- **Yarn** as package manager
- **date-fns** for date formatting
- **dagre** for automatic graph layout

## Getting Started

### Prerequisites
- Node.js 16+ and Yarn installed

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd graph-explorer
```

2. Install dependencies:
```bash
yarn install
```

3. Start the development server:
```bash
yarn dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
yarn build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
yarn preview
```

## Usage

1. **Enter an Address**: Type or paste an Alephium address in the search field
2. **Search**: Click the search button or press Enter
3. **View Visualization**: Explore the interactive graph showing transaction flow
4. **Interact with Nodes**:
   - Click on any node to view details in the side panel
   - Double-click on address nodes to explore that address
5. **Use Filters**: Expand advanced options to filter transactions
6. **Explore Connected Addresses**: Click "Explore This Address" in the info panel

## Project Structure

```
src/
  components/
    AddressInput/       - Address search component with filters
    AppBar/            - Top navigation bar
    CustomNodes/       - Custom React Flow node components
    FlowVisualization/ - Main React Flow graph component
    InfoPanel/         - Side drawer with detailed information
    Legend/            - Visual legend for the graph
    Statistics/        - Statistics overview component
  context/
    AppContext.tsx     - Global state management
  hooks/
    useAlephiumApi.ts  - Hook for Alephium API calls
    useTransactionFlow.ts - Hook for transaction flow logic
  services/
    alephiumService.ts - Alephium web3 service wrapper
  types/
    transaction.types.ts - Transaction type definitions
    node.types.ts      - Node and edge type definitions
  utils/
    addressValidation.ts - Address validation utilities
    dataTransformation.ts - Transform data to React Flow format
    formatting.ts      - Formatting utilities
  App.tsx             - Main application component
  main.tsx            - Application entry point
```

## API Integration

The application uses the official `@alephium/web3` library to interact with the Alephium blockchain:

- **Address Balance**: Fetches current balance and UTXO count
- **Address Transactions**: Retrieves transaction history with pagination
- **Transaction Details**: Gets detailed information about specific transactions
- **Network Support**: Works with Mainnet, Testnet, and Devnet

## Features in Detail

### Node Types
- **Central Address** (Blue): The address you're currently exploring
- **Connected Address** (Gray): Addresses that have transacted with the central address
- **Incoming Transaction** (Green): Transactions where the central address received ALPH
- **Outgoing Transaction** (Orange): Transactions where the central address sent ALPH

### Edge Types
- **Green Edges**: Incoming transaction flow
- **Orange Edges**: Outgoing transaction flow
- **Animated**: All edges are animated to show flow direction

### Interactions
- **Click Node**: View detailed information
- **Double-Click Address**: Explore that address
- **Drag Nodes**: Reposition nodes manually
- **Zoom/Pan**: Navigate large graphs
- **Fit View**: Auto-fit entire graph to screen

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

