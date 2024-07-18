// Example component for sending messages
import axios from 'axios';
import { useState } from 'react';

const SendMessageForm = () => {
    const [recipient, setRecipient] = useState('');
    const [message, setMessage] = useState('');

    const sendMessage = async () => {
        const token = localStorage.getItem('token');
        const headers = {
            Authorization: `Bearer ${token}`,
        };

        try {
            const response = await axios.post('/api/send-message', { recipient, message }, { headers });
            console.log('Message sent:', response.data.message);
            // Optionally update UI to show success message or update message list
        } catch (error) {
            console.error('Error sending message:', error.response.data.message);
            // Handle error (e.g., show error message to user)
        }
    };

    return (
        <div>
            <input type="email" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Recipient email" />
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type your message..." />
            <button onClick={sendMessage}>Send Message</button>
        </div>
    );
};

export default SendMessageForm;
