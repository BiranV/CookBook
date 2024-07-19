const Message = require('../models/message');

const sendMessage = async (req, res) => {
    const { recipient, message } = req.body;

    try {
        const newMessage = await Message.create({ sender: req.user.email, recipient, message });

        return res.status(201).json({ message: 'Message sent successfully', obj: newMessage });
    } catch (error) {
        console.error('Error sending message:', error);
        return res.status(500).json({ message: 'Failed to send message' });
    }
};

const getMessages = async (req, res) => {
    try {
        const messages = await Message.find({ recipient: req.user.email });
        const messageCount = messages.length;

        return res.status(200).json({ messages, count: messageCount });
    } catch (error) {
        console.error('Error retrieving messages:', error);
        return res.status(500).json({ message: 'Failed to retrieve messages' });
    }
};


module.exports = {
    sendMessage,
    getMessages
};
