import { useEffect, useState } from 'react';
import axios from '../api/axios';

const InboxButton = () => {
    const [hasMessages, setHasMessages] = useState(false);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await axios.get('/messages');
                setHasMessages(response.data.length > 0);
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };

        fetchMessages();
    }, []);

    return (
        <button className="inbox-btn" onClick={() => console.log('Navigate to inbox')}>
            Inbox {hasMessages && <span className="inbox-badge"></span>}
        </button>
    );
};

export default InboxButton;