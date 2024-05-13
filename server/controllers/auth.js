const User = require('../models/auth');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const handleErrorResponse = (res, error) => {
    res.status(500).json({ error: error.message });
};

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        // Generate JWT token with user's email
        const token = jwt.sign({ _id: user._id.toString(), email: user.email }, process.env.JWT_SECRET);
        res.json({ token, email: user.email });
    } catch (error) {
        handleErrorResponse(res, error);
    }
};

const signup = async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        user = await User.create({ email, password: hashedPassword });
        // Generate JWT token with user's email
        const token = jwt.sign({ _id: user._id.toString(), email: user.email }, process.env.JWT_SECRET);
        res.json({ token, email: user.email });
    } catch (error) {
        handleErrorResponse(res, error);
    }
};

module.exports = {
    login,
    signup
};
