import { Link } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { useGuestMode } from '../context/GuestModeContext';

export default function Header() {
  const { setGuestMode, guestMode } = useGuestMode();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthRoute = location.pathname === "/auth";
  const isLoggedIn = !!localStorage.getItem("token");

  const handleLogin = () => {
    navigate("/auth");
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    setGuestMode(true);
    navigate("/")
  };

  return (
    <header className="header">
      <Link onClick={() => window.location.href = "/"} className="logo">CookBook</Link>
      {!isAuthRoute && !guestMode && isLoggedIn && (
        <button onClick={handleLogout} className="logout-btn">Log Out</button>
      )}
      {!isAuthRoute && !isLoggedIn && (
        <button onClick={handleLogin} className="login-btn">Login</button>
      )}
    </header>
  );
}
