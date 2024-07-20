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


const deleteMessage = async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        if (message.recipient !== req.user.email) {
            return res.status(403).json({ message: 'You are not authorized to delete this message' });
        }

        await Message.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Message deleted successfully' });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ message: 'Failed to delete message' });
    }
};


module.exports = {
    sendMessage,
    getMessages,
    deleteMessage
};
