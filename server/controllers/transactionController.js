const Transaction = require('../models/Transaction');
const Customer = require('../models/Customer');

// @desc    Add a new transaction (credit or payment)
// @route   POST /api/transactions
// @access  Private
const addTransaction = async (req, res) => {
    const { customerId, type, amount, note, date, attachment } = req.body;

    try {
        const customer = await Customer.findById(customerId);

        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        if (customer.shopOwnerId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const transaction = new Transaction({
            customerId,
            shopOwnerId: req.user._id,
            type,
            amount,
            note,
            attachment,
            date: date || Date.now()
        });

        const createdTransaction = await transaction.save();

        // Update customer totalCredit
        // Credit increases balance, Payment decreases balance
        const amountChange = type === 'credit' ? amount : -amount;
        customer.totalCredit += amountChange;
        await customer.save();

        res.status(201).json(createdTransaction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get transactions for a specific customer
// @route   GET /api/transactions/:customerId
// @access  Private
const getTransactionsByCustomer = async (req, res) => {
    try {
        const transactions = await Transaction.find({ 
            customerId: req.params.customerId,
            shopOwnerId: req.user._id 
        }).sort({ date: -1 });
        
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        if (transaction.shopOwnerId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const customer = await Customer.findById(transaction.customerId);
        if (customer) {
            // Reverse the effect on totalCredit
            const amountChange = transaction.type === 'credit' ? -transaction.amount : transaction.amount;
            customer.totalCredit += amountChange;
            await customer.save();
        }

        await Transaction.deleteOne({ _id: req.params.id });
        res.json({ message: 'Transaction removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get daily transaction stats for dashboard
// @route   GET /api/transactions/stats
// @access  Private
const getTransactionStats = async (req, res) => {
    try {
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);

        const transactions = await Transaction.find({
            shopOwnerId: req.user._id,
            date: { $gte: last7Days }
        });

        // Group by date
        const stats = {};
        // Initialize last 7 days
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            stats[dateStr] = { credit: 0, payment: 0, date: dateStr };
        }

        transactions.forEach(tx => {
            const dateStr = tx.date.toISOString().split('T')[0];
            if (stats[dateStr]) {
                if (tx.type === 'credit') {
                    stats[dateStr].credit += tx.amount;
                } else {
                    stats[dateStr].payment += tx.amount;
                }
            }
        });

        const result = Object.values(stats).sort((a, b) => a.date.localeCompare(b.date));
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addTransaction,
    getTransactionsByCustomer,
    deleteTransaction,
    getTransactionStats
};
