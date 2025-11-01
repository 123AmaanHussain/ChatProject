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

    connectSocket : () => {
        const {authUser} = get();
        if(!authUser || get().socket?.connected){
            return;
        }
        const socket = io(BASE_URL, {withCredentials:true}); //this ensures cookies are connected with connection
        socket.connect();

        set({socket});

        //listen for online events
        socket.on("getOnlineUsers", (userIds) => {
            set({onlineUsers:userIds})
        })
    },

    disconnectSocket : () => {
        if(get().socket?.connected){
            get().socket.disconnect()
        }
    }
}));