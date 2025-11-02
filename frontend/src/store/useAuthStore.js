import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:3000" : "/";

export const useAuthStore = create((set, get) => ({
    authUser : null,
    isCheckingAuth : true,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    socket: null,
    onlineUsers: [],

    checkAuth : async () => {
        try {
            const res = await axiosInstance.get("/auth/check");
            set({authUser : res.data});
            get().connectSocket();

        } catch (error) {
            console.log("Error in authCheck:", error)
            set({authUser : null})
        }finally{
            set({isCheckingAuth:false})
        }
    },

    signup : async (Data) => {
        set({isSigningUp: true})
        try {
            const res = await axiosInstance.post("/auth/signup", Data);
            set({authUser : res.data})
            toast.success("Account Created Successfully!!!");
            get().connectSocket();
        } catch (error) {
            toast.error(error.response.data.message);
        }finally{
            set({isSigningUp:false})
        }
    },

    login : async (Data) => {
        set({isLoggingIn: true})
        try {
            const res = await axiosInstance.post("/auth/login", Data);
            set({authUser : res.data})
            toast.success("Login Successful");
            get().connectSocket();
        } catch (error) {
            toast.error(error.response.data.message);
        }finally{
            set({isLoggingIn:false})
        }
    },
    logout : async() => {
        try {
            const res = await axiosInstance.post("/auth/logout");
            set({authUser : null})
            toast.success("Logout Successful");
            get().disconnectSocket();
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },

    updateProfile : async (Data) => {
        set({isUpdatingProfile: true})
        try {
            const res = await axiosInstance.put("/auth/update-profile", Data);
            set({authUser : res.data})
            toast.success("Profile Updated Successfully!!!")
        } catch (error) {
            console.log("Error in updateProfile:", error)
            toast.error(error.response?.data?.message || "Failed to update profile");
        }finally{
            set({isUpdatingProfile:false})
        }
    },

    connectSocket: () => {
        const { authUser, socket: existingSocket } = get();
        
        // If already connected or no auth user, do nothing
        if (!authUser || (existingSocket?.connected)) {
            return;
        }

        // Disconnect existing socket if any
        if (existingSocket) {
            existingSocket.disconnect();
        }

        // Create new socket connection
        const socket = io(BASE_URL, {
            withCredentials: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000
        });

        // Set up event listeners
        socket.on('connect', () => {
            console.log('WebSocket connected');
            // Emit user online status
            socket.emit('setup', authUser._id);
        });

        socket.on('disconnect', (reason) => {
            console.log('WebSocket disconnected:', reason);
        });

        socket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
        });

        // Listen for online users
        socket.on('getOnlineUsers', (userIds) => {
            set({ onlineUsers: userIds });
        });

        set({ socket });
    },

    disconnectSocket: () => {
        const { socket } = get();
        if (socket) {
            socket.disconnect();
            set({ socket: null, onlineUsers: [] });
        }
    }
}));