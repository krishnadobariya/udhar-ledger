const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    shopOwnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['credit', 'payment'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    note: {
        type: String,
        trim: true
    },
    attachment: {
        type: String // URL or base64
    },
    date: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;
