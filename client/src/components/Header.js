import { Link } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthMode } from '../context/AuthModeContext';

export default function Header() {
  const { setAuthMode, authMode } = useAuthMode();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthRoute = location.pathname === "/auth";
  const isLoggedIn = !!localStorage.getItem("token");

  const handleLogin = () => {
    navigate("/auth");
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    setAuthMode(false);
    navigate("/")
  };

  return (
    <header className="header">
      <Link onClick={() => window.location.href = "/"} className="logo">CookBook</Link>
      {!isAuthRoute && authMode && isLoggedIn && (
        <button onClick={handleLogout} className="logout">Log Out</button>
      )}
      {!isAuthRoute && !authMode && (
        <button onClick={handleLogin} className="login">Login</button>
      )}
    </header>
  );
}
