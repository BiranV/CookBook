import { useState, useEffect } from 'react';
import axios from '../api/axios';
import Spinner from '../components/Spinner';
import { getUserEmailFromToken } from '../utils/authUtils';
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';

const Messages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMessages = async () => {
            const userEmail = getUserEmailFromToken(); // Retrieve user email from JWT token
            if (!userEmail) {
                console.error('User email not found in token');
                setLoading(false);
                navigate("/auth");
                return;
            }

            try {
                const response = await axios.get('/messages', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                        'X-User-Email': userEmail
                    }
                });
                toast("You are not authorized to delete this recipe.");
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
            <ToastContainer
                position="top-center"
                autoClose={2000}
                closeOnClick
                rtl={false}
            />
            {messages.length === 0 ? (
                <p>No messages found.</p>
            ) : (
                <>
                    {messages.map((message, index) => (
                        <div className="card" key={index}>
                            <h5>From: {message.sender}</h5>
                            <p><strong>Message:</strong> {message.message}</p>
                            <p><strong>Sent:</strong> {new Date(message.createdAt).toLocaleString()}</p>
                        </div>
                    ))}
                </>
            )}
        </div>
    );
};

export default Messages;
