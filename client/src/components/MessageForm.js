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
            toast("Message sent successfully");
        } catch (error) {
            setError('Failed to send message');
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="message-form">
            <form onSubmit={handleSubmit}>
                <label htmlFor="message">Leave a message:</label>
                <textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} rows="4" required></textarea>
                {sending && <p>Sending message...</p>}
                {error && <p className="error">{error}</p>}
                {sentMessage && <p className="success">Message sent successfully</p>}
                <button className='message-btn' type="submit" disabled={sending}>Send</button>
            </form>
        </div>
    );
};

export default MessageForm;
