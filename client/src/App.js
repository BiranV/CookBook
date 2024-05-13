import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { AuthModeProvider } from "./context/AuthModeContext";
import Navbar from "./components/Navbar"
import Spinner from "./components/Spinner";
import { lazy, Suspense } from 'react';

const Home = lazy(() => import("./pages/Home"));
const Auth = lazy(() => import("./pages/Auth"));
const NotFound = lazy(() => import("./pages/NotFound"));


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
            <Suspense fallback={<Spinner />}>
                <RouterProvider router={router} />
            </Suspense>
        </AuthModeProvider>
    )
}
