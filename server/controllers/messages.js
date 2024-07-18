// controllers/messages.js
const Message = require('../models/message');
const User = require('../models/auth');

const sendMessage = async (req, res) => {
    const { sender, name, recipient, message } = req.body;

    try {
        const newMessage = await Message.create({ sender, name, recipient, message });

        return res.status(201).json({ message: 'Message sent successfully', obj: newMessage });
    } catch (error) {
        console.error('Error sending message:', error);
        return res.status(500).json({ message: 'Failed to send message' });
    }
};

const getMessages = async (req, res) => {
    const userEmail = req.user.email;

    try {
        // Retrieve messages where the authenticated user is either sender or recipient
        const messages = await Message.find({ $or: [{ sender: userEmail }, { recipient: userEmail }] });

        return res.status(200).json(messages);
    } catch (error) {
        console.error('Error retrieving messages:', error);
        return res.status(500).json({ message: 'Failed to retrieve messages' });
    }
};

module.exports = {
    sendMessage,
    getMessages
};
