import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import Spinner from '../components/Spinner';

const Messages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await axios.get('/messages'); // Adjust endpoint URL as needed
                setMessages(response.data);
            } catch (error) {
                console.error('Error fetching messages:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, []);

    if (loading) {
        return <Spinner />;
    }

    return (
        <div className="messages">
            <h2>Messages</h2>
            {messages.length === 0 ? (
                <p>No messages found.</p>
            ) : (
                <ul>
                    {messages.map((message, index) => (
                        <li key={index}>
                            <strong>From:</strong> {message.from}<br />
                            <strong>Message:</strong> {message.message}<br />
                            <strong>Sent:</strong> {new Date(message.createdAt).toLocaleString()}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Messages;
