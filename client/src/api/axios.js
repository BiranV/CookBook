import axios from "axios"

export default axios.create({
    baseURL: "https://cook-book-server-mu.vercel.app/"
})