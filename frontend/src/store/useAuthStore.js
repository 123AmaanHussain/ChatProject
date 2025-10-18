import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
    authUser : null,
    isCheckingAuth : true,
    isSigningUp: false,
    isLoggingIn: false,

    checkAuth : async () => {
        try {
            const res = await axiosInstance.get("/auth/check");
            set({authUser : res.data})

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
            toast.success("Account Created Successfully!!!")
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
            toast.success("Login Successful")
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
            toast.success("Logout Successful")
        } catch (error) {
            toast.error(error.response.data.message);
        }
    }
}));