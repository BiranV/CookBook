import { useState, useEffect } from 'react';
import axios from '../api/axios';
import Spinner from '../components/Spinner';
import { getUserEmailFromToken } from '../utils/authUtils';
import { useNavigate } from "react-router-dom";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'; // Import delete icon

const Messages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMessages = async () => {
            const userEmail = getUserEmailFromToken();
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
                setMessages(response.data.messages);
            } catch (error) {
                console.error('Error fetching messages:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, [navigate]);

    const handleDeleteMessage = async (messageId) => {
        try {
            await axios.delete(`/messages/${messageId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            setMessages(messages.filter(message => message._id !== messageId));
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    };

    if (loading) {
        return <Spinner />;
    }

    return (
        <div className="messages">
            {messages.length === 0 ? (
                <h3>No messages found.</h3>
            ) : (
                messages.map((message) => (
                    <div className="card" key={message._id}>
                        <div className='details'>
                            <p><strong>From:</strong>  {message.sender}</p>
                            <p><strong>Message:</strong> {message.message}</p>
                            <p><strong>Sent:</strong> {new Date(message.createdAt).toLocaleString()}</p>
                        </div>
                        <DeleteOutlineIcon
                            className="icon"
                            onClick={() => handleDeleteMessage(message._id)}
                        />
                    </div>
                ))

            )}
        </div>
    );
};

export default Messages;
