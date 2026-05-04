const Customer = require('../models/Customer');
const Transaction = require('../models/Transaction');

// @desc    Add a new customer
// @route   POST /api/customers
// @access  Private
const addCustomer = async (req, res) => {
    const { name, mobileNumber, address } = req.body;

    try {
        const customer = new Customer({
            name,
            mobileNumber,
            address,
            shopOwnerId: req.user._id
        });

        const createdCustomer = await customer.save();
        res.status(201).json(createdCustomer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all customers for a shop
// @route   GET /api/customers
// @access  Private
const getCustomers = async (req, res) => {
    try {
        const customers = await Customer.find({ shopOwnerId: req.user._id }).sort({ createdAt: -1 });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get customer details and transactions
// @route   GET /api/customers/:id
// @access  Private
const getCustomerById = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);

        if (customer) {
            // Verify ownership
            if (customer.shopOwnerId.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized to view this customer' });
            }

            const transactions = await Transaction.find({ customerId: req.params.id }).sort({ date: -1 });
            res.json({ customer, transactions });
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update customer details
// @route   PUT /api/customers/:id
// @access  Private
const updateCustomer = async (req, res) => {
    const { name, mobileNumber, address } = req.body;

    try {
        const customer = await Customer.findById(req.params.id);

        if (customer) {
            if (customer.shopOwnerId.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized' });
            }

            customer.name = name || customer.name;
            customer.mobileNumber = mobileNumber || customer.mobileNumber;
            customer.address = address || customer.address;

            const updatedCustomer = await customer.save();
            res.json(updatedCustomer);
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private
const deleteCustomer = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);

        if (customer) {
            if (customer.shopOwnerId.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized' });
            }

            // Delete associated transactions
            await Transaction.deleteMany({ customerId: req.params.id });
            await Customer.deleteOne({ _id: req.params.id });
            
            res.json({ message: 'Customer and their transactions removed' });
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addCustomer,
    getCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer
};
