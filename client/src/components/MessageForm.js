import { useState } from 'react';
import axios from '../api/axios';

const MessageForm = ({ recipient  }) => {
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [sentMessage, setSentMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post('/messages', { recipient , name, message }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setSentMessage(response.data.message);
        } catch (error) {
            setError('Failed to send message');
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
            setName('');
            setMessage('');
            setSentMessage(null);
            setError(null);
        }
    };

    return (
        <div className="message-form">
            <h2>Send a Message</h2>
            <form onSubmit={handleSubmit}>
                <label htmlFor="name">Name:</label>
                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />

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
