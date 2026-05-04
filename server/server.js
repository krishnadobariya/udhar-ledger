require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/transactions', transactionRoutes);

// Health check
app.get('/', (req, res) => {
    res.send('Udhaar Ledger API is running...');
});

// Connect to Database and start server
connectDB().then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
}).catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
});
