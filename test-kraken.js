const WebSocket = require('ws');

const ws = new WebSocket('wss://ws.kraken.com');

ws.on('open', () => {
  console.log('Connected to Kraken WS');
  ws.send(JSON.stringify({
    event: 'subscribe',
    pair: ['XBT/USD', 'ETH/USD', 'SOL/USD'],
    subscription: { name: 'ticker' }
  }));
});

ws.on('message', (data) => {
  console.log('Received:', data.toString());
  // Wait for a few messages to ensure it's data
  setTimeout(() => process.exit(0), 1000);
});

ws.on('error', (err) => {
  console.error('WS Error:', err);
  process.exit(1);
});

setTimeout(() => {
  console.log('Timeout');
  process.exit(1);
}, 5000);
