import { create } from "zustand";
import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

axios.defaults.withCredentials = true;

export const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: false,
    error: null,
    isLoading: false,
    isCheckingAuth: true,

    signup: async (email, password, name) => {
        set({ isLoading: true, error: null });

        try {
            const response = await axios.post(`${API_URL}/signup`, { email, password, name });

            set({
                user: response.data.user,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (error) {
            set({
                error: error.response.data.message || "Error signup",
                isLoading: false,
            });
            throw error;
        }
    },

    login: async (email, password) => {
        set({ isLoading: true, error: null });

        try {
            const response = await axios.post(`${API_URL}/login`, { email, password });

            set({
                user: response.data.user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });
        } catch (error) {
            set({
                error: error.response?.data?.message || "Error login",
                isLoading: false,
            });
            throw error;
        }

    },

    logout: async () => {
        set({ isLoading: true, error: null });

        try {
            await axios.post(`${API_URL}/logout`);

            set({
                user: null,
                isAuthenticated: false,
                error: null,
                isLoading: false
            });
        } catch (error) {
            set({
                error: "Error logout",
                isLoading: false,
            });
            throw error;
        }
    },

    verifyEmail: async (code) => {
        set({ isLoading: true, error: null });

        try {
            const response = await axios.post(`${API_URL}/verify-email`, { code });

            set({
                user: response.data.user,
                isAuthenticated: true,
                isLoading: false,
            });

            return response.data;

        } catch (error) {
            set({
                error: error.response.data.message || "Error virifying email",
                isLoading: false,
            });
            throw error;
        }
    },

    checkAuth: async () => {
        setTimeout(2000);

        set({
            isCheckingAuth: true,
            error: null,
        });

        try {
            const response = await axios.get(`${API_URL}/check-auth`);

            set({
                user: response.data.user,
                isAuthenticated: true,
                isCheckingAuth: false,
            });

        } catch (error) {
            set({
                error: null,
                isCheckingAuth: false,
                isAuthenticated: false,
            });
            console.log(error);
        }
    },

    forgotPassword: async (email) => {
        set({
            isLoading: true,
            error: null,
            message: null,
        });

        try {
            const response = await axios.post(`${API_URL}/forgot-password`, { email });

            set({
                message: response.data.message,
                isLoading: false,
            });
        } catch (error) {
            set({
                error: error.response.data.message || "Error sending reset password email",
                isLoading: false,
            });
            throw error;
        }
    },
}));

















