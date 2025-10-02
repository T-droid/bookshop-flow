import axios from "axios";

let accessToken: string | null = null

export const setAccessToken = (token: string | null) => {
    accessToken = token;
}

export const getAccessToken = () => accessToken;

export const refreshAccessToken = async () => {
    const res = await axios.post("https://bookshop-flow.onrender.com/auth/refresh", {}, { withCredentials: true });
    setAccessToken(res.data.access_token);
}