import axios from "axios";

const api = axios.create({
    baseURL: "https://localhost:7217/activos/",
    headers: {
        "Content-Type": "application/json",
    },
});

export default api;