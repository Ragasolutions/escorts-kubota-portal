const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();
const { notFound, errorHandler } = require('./middleware/error.middleware');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const userRoutes = require('./routes/user.routes');

const app = express();
connectDB();

// ─── Middleware ───────────────────────────────────
app.use(helmet());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173')
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})
app.use(morgan('dev'));
app.use(cors({
  origin: '*',
  credentials: true,
}))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ─────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Escorts Kubota API is running',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);


// ─── Routes (will be added one by one) ────────────
// app.use('/api/auth',     require('./routes/auth.routes'));
// app.use('/api/products', require('./routes/product.routes'));
// app.use('/api/orders',   require('./routes/order.routes'));
// app.use('/api/users',    require('./routes/user.routes'));

// ─── Error Handling ───────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV}`);
});