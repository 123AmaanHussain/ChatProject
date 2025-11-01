import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ENV } from "../lib/env.js";

export const socketAuthMiddleware = async (socket, next) => {
    try {
        //extract the token from http cookies
        const token = socket.handshake.headers.cookie
            ?.split(";")
            .find((row) => row.startsWith("jwt="))
            ?.split("=")[1];

        if (!token) {
            console.log("Socket connection rejected: No token provided")
            return next(new Error("Authentication error"));
        }
        //verify the token
        const decoded = jwt.verify(token, ENV.JWT_SECRET);
        if(!decoded){
            console.log("Socket connection rejected: Invalid token")
            return next(new Error("Invalid Token"));
        }
        const user = await User.findById(decoded.userId).select("-password");
        if(!user){
            console.log("Socket connection rejected: Invalid token")
            return next(new Error("User not found"));
        }
        //attach user info to socket
        socket.user = user;
        socket.userId = user._id.toString();

        console.log(`Socket connection accepted for user: ${user.fullName} (${user._id})`);
        next();

    } catch (error) {
        console.log("Socket connection rejected: Invalid token")
        return next(new Error("Authentication error"));
    }
}