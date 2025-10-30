# Quick Start Guide

## Installation and Running

### 1. Start the Development Server

```bash
yarn dev
```

The application will open automatically at `http://localhost:3000`

### 2. Using the Application

1. **Enter an Address**: Type or paste an Alephium address in the search field at the top
2. **Search**: Click the "Search" button or press Enter
3. **View the Visualization**: The interactive graph will display showing:
   - Your central address (blue node in the center)
   - Incoming transactions (green nodes on the left)
   - Outgoing transactions (orange nodes on the right)
   - Connected addresses (gray nodes)

### 3. Interacting with the Graph

- **Click a node**: View detailed information in the side panel
- **Double-click an address node**: Explore that address (it becomes the new center)
- **Drag nodes**: Reposition them for better visibility
- **Zoom and Pan**: Use mouse wheel to zoom, drag to pan
- **Fit View**: Click the center focus button in the top-right controls

### 4. Advanced Options

Click "Advanced Options" in the search panel to:
- Adjust transaction limit (10-200)
- Set maximum depth (1-5)
- Toggle incoming/outgoing transaction visibility

### 5. Example Addresses

Try these example addresses (click on the chips):
- `1DrDyTr9RpRsQnDnXo2YRiPzPW4ooHX5LLoqXrqfMrpQH`
- `1C2RAVWSuaXw8xtUxqVERR7ChKBE1XgscNFw73NSHE1v3`

### 6. Network Switching

Use the network selector in the top-right to switch between:
- Mainnet (default)
- Testnet
- Devnet

## Building for Production

```bash
yarn build
```

Built files will be in the `dist/` directory.

## Preview Production Build

```bash
yarn preview
```

## Features Overview

### Visual Elements

- **Blue Nodes**: Central address (the one you're exploring)
- **Green Nodes**: Incoming transactions
- **Orange Nodes**: Outgoing transactions
- **Gray Nodes**: Connected addresses
- **Green Edges**: Flow of incoming transactions
- **Orange Edges**: Flow of outgoing transactions

### Statistics Panel

Shows real-time statistics:
- Current balance
- Total incoming amount and transaction count
- Total outgoing amount and transaction count
- Net flow (incoming - outgoing)

### Info Panel

Click any node to see:
- Full address or transaction hash
- Amount transferred
- Timestamp
- Confirmations (for transactions)
- Links to Alephium Explorer
- "Explore This Address" button for quick navigation

### Controls

- **Zoom Controls**: Bottom-left corner
- **Minimap**: Bottom-right corner (for large graphs)
- **Legend**: Bottom-right (collapsible)
- **Refresh**: Top-right panel
- **Fit View**: Top-right panel

## Tips for Best Experience

1. Start with a lower transaction limit (50) for faster loading
2. Use the filters to focus on specific transaction types
3. Double-click addresses to navigate through the transaction chain
4. Use the minimap for overview when working with large graphs
5. Toggle dark mode using the button in the top-right corner

## Troubleshooting

### No transactions showing?
- Verify the address is valid
- Check if the address has any transactions on the selected network
- Try switching between Mainnet/Testnet

### Slow loading?
- Reduce the transaction limit in advanced options
- The application fetches real-time data from the blockchain

### Graph looks cluttered?
- Use filters to show only incoming or outgoing transactions
- Reduce the transaction limit
- Use the fit view button to reorganize

## Need Help?

Check the README.md for detailed information about:
- Architecture and project structure
- API integration details
- Component documentation
- Type definitions

