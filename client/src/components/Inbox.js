import { useEffect, useState } from 'react';
import axios from '../api/axios';

const Inbox = () => {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await axios.get('/messages');
                setMessages(response.data);
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };

        fetchMessages();
    }, []);

    return (
        <div className="inbox">
            <h2>Inbox</h2>
            {messages.map((msg, index) => (
                <div key={index} className="message">
                    <p>From: {msg.from}</p>
                    <p>Message: {msg.message}</p>
                    <p>Sent: {new Date(msg.createdAt).toLocaleString()}</p>
                </div>
            ))}
        </div>
    );
};

export default Inbox;
