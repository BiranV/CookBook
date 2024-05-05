import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";

export default function Auth() {
    const navigate = useNavigate();

    const [isLogin, setIsLogin] = useState(true);

    const toggleAuthMode = () => {
        setIsLogin((prevMode) => !prevMode);
    };

    const navigateToHome = () => {
        navigate("/");
    };

    return (
        <div className="auth">
            <AuthForm mode={isLogin ? "login" : "signup"} onSuccess={navigateToHome} />
            <label>
                {isLogin
                    ? "Don't have an account? "
                    : "Already have an account? "}
                <span onClick={toggleAuthMode}>
                    {isLogin ? "Sign Up" : "Login"}
                </span>
            </label>
        </div>
    );
}
