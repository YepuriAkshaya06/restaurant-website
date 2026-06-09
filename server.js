const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const ORDERS_FILE = path.join(__dirname, 'restaurant_orders.json');

if (!fs.existsSync(ORDERS_FILE)) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify([]));
}
// Welcome route for root URL - fixes "Cannot GET /" error
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Spice Garden Restaurant API! 🍛',
    status: '✅ Server is running successfully',
    documentation: {
      endpoints: {
        'GET /': 'This welcome message',
        'GET /api/orders': 'Get all customer orders',
        'POST /api/orders': 'Create a new order',
        'PATCH /api/orders/:id': 'Update order status'
      },
      frontend: 'https://unique-choux-e1c59c.netlify.app',
      github: 'https://github.com/YepuriAkshaya06/restaurant-website',
      instructions: 'Use POST requests to /api/orders to place orders'
    },
    timestamp: new Date().toISOString()
  });
});
// Get all orders
app.get('/api/orders', (req, res) => {
  const orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8'));
  res.json(orders);
});

// Create new order
app.post('/api/orders', (req, res) => {
  const { item, quantity, customer, phone, address, payment_method, special_notes, total_amount } = req.body;
  
  if (!item || !customer || !phone || !address) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8'));
  
  const newOrder = {
    id: Date.now(),
    item: item,
    quantity: quantity || 1,
    customer: customer,
    phone: phone,
    address: address,
    payment_method: payment_method || 'Cash',
    special_notes: special_notes || '',
    total_amount: total_amount || 0,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  orders.push(newOrder);
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
  
  console.log(`📝 New Order #${newOrder.id} from ${customer}: ${item} x${quantity} = ₹${total_amount}`);
  res.status(201).json({ success: true, orderId: newOrder.id });
});

// Update order status
app.patch('/api/orders/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;
  const orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8'));
  const orderIndex = orders.findIndex(o => o.id === id);
  
  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  orders[orderIndex].status = status || orders[orderIndex].status;
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
  res.json({ success: true, order: orders[orderIndex] });
});

app.listen(PORT, () => {
  console.log(`🍽️ Restaurant Server running on http://localhost:${PORT}`);
  console.log(`📦 Orders saved to: ${ORDERS_FILE}`);
});