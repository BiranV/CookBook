import axios from "axios"

export default axios.create({
    baseURL: "http://localhost:5000/",
    // baseURL: "https://cook-book-server-mu.vercel.app/"
})