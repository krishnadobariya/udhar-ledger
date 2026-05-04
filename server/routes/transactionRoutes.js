const express = require('express');
const router = express.Router();
const { 
    addTransaction, 
    getTransactionsByCustomer, 
    deleteTransaction,
    getTransactionStats
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addTransaction);
router.get('/stats/daily', protect, getTransactionStats);
router.get('/:customerId', protect, getTransactionsByCustomer);
router.delete('/:id', protect, deleteTransaction);

module.exports = router;
