import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthMode } from '../context/AuthModeContext';
import MailIcon from '@mui/icons-material/Mail';
import axios from '../api/axios';

const Header = () => {
  const { setAuthMode, authMode } = useAuthMode();
  const navigate = useNavigate();
  const location = useLocation();

  const [messageCount, setMessageCount] = useState(0);

  const fetchMessages = async () => {
    try {
      const response = await axios.get('/messages', {
        headers: {
          Authorization: `Bearer ${ localStorage.getItem('token') }`
        }
      });
      setMessageCount(response.data.count);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    if (localStorage.getItem('token')) {
      fetchMessages();
      const intervalId = setInterval(fetchMessages, 6000);
      return () => clearInterval(intervalId);
    } else {
      setMessageCount(0);
    }
  }, [authMode]);

  const isAuthRoute = location.pathname === "/auth";
  const isLoggedIn = !!localStorage.getItem("token");

  const handleLogin = () => {
    navigate("/auth");
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    setAuthMode(false);
    setMessageCount(0); // Clear message count on logout
    navigate("/")
  };

  const handleInbox = () => {
    navigate("/messages");
  }

  return (
    <header className="header">
      <Link to="/" className="logo">CookBook</Link>
      <div className="header-btns">
        {!isAuthRoute && authMode && isLoggedIn && (
          <>
            <button onClick={handleInbox} className="inbox-btn">
              <MailIcon />
              {messageCount > 0 && <span className="message-count">{messageCount}</span>}
            </button>
            <button onClick={handleLogout} className="logout-btn">Log Out</button>
          </>
        )}
        {!isAuthRoute && !authMode && (
          <button onClick={handleLogin} className="login-btn">Login</button>
        )}
      </div>
    </header>
  );
}

export default Header;
