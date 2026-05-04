const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, mobileNumber, password, shopName } = req.body;

    try {
        const userExists = await User.findOne({ mobileNumber });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this mobile number' });
        }

        const user = await User.create({
            name,
            mobileNumber,
            password,
            shopName
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                mobileNumber: user.mobileNumber,
                shopName: user.shopName,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { mobileNumber, password } = req.body;

    try {
        const user = await User.findOne({ mobileNumber });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                mobileNumber: user.mobileNumber,
                shopName: user.shopName,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid mobile number or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser
};
