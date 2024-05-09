import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { AuthModeProvider } from "./context/AuthModeContext";
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import Auth from "./pages/Auth"
import NotFound from "./pages/NotFound"

const router = createBrowserRouter([
    {
        path: "/", element: <Navbar />, children: [
            { path: "/", element: <Home /> },
            { path: "/auth", element: <Auth /> },
            { path: "/*", element: <NotFound /> },
        ]
    }
])
export default function App() {
    return (
        <AuthModeProvider>
            <RouterProvider router={router} />
        </AuthModeProvider>
    )
}
