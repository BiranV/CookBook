import { useState } from 'react';
import axios from '../api/axios';

const MessageForm = ({ recipient, sender }) => {
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [sentMessage, setSentMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post('/messages', { recipient, sender, message }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setSentMessage(response.data.message);
            setMessage('');
        } catch (error) {
            setError('Failed to send message');
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="message-form">
            <h2>Send a Message</h2>
            <form onSubmit={handleSubmit}>
                <label htmlFor="message">Message:</label>
                <textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} rows="4" required></textarea>
                {sending && <p>Sending message...</p>}
                {error && <p className="error">{error}</p>}
                {sentMessage && <p className="success">Message sent successfully</p>}

                <button type="submit" disabled={sending}>Send Message</button>
            </form>
        </div>
    );
};

export default MessageForm;
