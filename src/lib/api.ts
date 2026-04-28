import axios from "axios";
import { getConfig } from "../config/store";

const API_BASE = process.env.API_BASE;

export const api = axios.create({
    baseURL: API_BASE,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
    },
    timeout: 30000,
})

api.interceptors.request.use(async (config) => {
    const stored = getConfig();
    if (!stored) return config;


    if (stored.accessToken) {
        config.headers.Authorization = `Bearer ${stored.accessToken}`;
    }

    return config;
})