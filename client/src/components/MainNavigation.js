import { Link } from "react-router-dom";
import { useLocation, useNavigate } from "react-router-dom";


export default function MainNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthRoute = location.pathname === "/auth";

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth")
  };

  return (
    <header className="header">
      <Link onClick={() => window.location.href = "/"} className="logo">CookBook</Link>
      {!isAuthRoute && (
        <button onClick={handleLogout} className="logout-btn">Log Out</button>
      )}
    </header>
  );
}
