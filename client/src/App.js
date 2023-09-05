import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { Provider } from "react-redux";
import store from './store/index';
import Navbar from "./components/Navbar"
import Home from "./pages/Home"

const router = createBrowserRouter([
    {
        path: "/", element: <Navbar />, children: [
            { path: "/", element: <Home /> },
        ]
    }
])
export default function App() {
    return (
        <Provider store={store}>
            <RouterProvider router={router} />
        </Provider>
    )
}
