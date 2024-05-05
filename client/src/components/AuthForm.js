import { useState, useRef, useEffect } from "react";
import axios from "../api/axios";

export default function AuthForm({ mode, onSuccess }) {
    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        emailRef.current.value = "";
        passwordRef.current.value = "";
        setError("");
    }, [mode]);

    const handleAuth = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            let response;
            if (mode === "login") {
                response = await axios.post("/login", {
                    email: emailRef.current.value,
                    password: passwordRef.current.value,
                });
            } else if (mode === "signup") {
                response = await axios.post("/signup", {
                    email: emailRef.current.value,
                    password: passwordRef.current.value,
                });
            }

            if (response && response.data && response.data.token) {
                const token = response.data.token;
                localStorage.setItem("token", token);
                onSuccess();
            } else {
                console.log("Token not found in response data");
            }
        } catch (error) {
            console.error("Error:", error.message);
            if (error.response && error.response.data && error.response.data.message) {
                setError(error.response.data.message);
            } else {
                setError("An error occurred. Please try again later.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>{mode === "login" ? "Login" : "Sign Up"}</h2>
            <form onSubmit={handleAuth}>
                <label htmlFor="email">Email</label>
                <input type="email" id="email" placeholder="Enter your email" ref={emailRef} required />
                <label htmlFor="password">Password</label>
                <input type="password" id="password" placeholder="Enter your password" ref={passwordRef} required />
                <button className="btn-login" type="submit" disabled={loading}>
                    {loading ? `${ mode === "login" ? "Logging in..." : "Signing up..." }` : `${ mode === "login" ? "Login" : "Signup" }`}
                </button>
                {error && (
                    <p>{error}</p>
                )}
            </form>
        </div>
    );
}
