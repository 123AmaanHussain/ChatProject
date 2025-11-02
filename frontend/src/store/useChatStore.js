import {create} from "zustand";
import {axiosInstance} from "../lib/axios.js";
import toast from "react-hot-toast";
import {useAuthStore} from "./useAuthStore.js";




export const useChatStore=create((set,get)=>({
    allContacts: [],
    chats: [],
    messages: [],
    activeTab:"chats",
    selectedUser:null,
    isUsersLoading: false,
    isMessagesLoading:false,
    isSoundEnabled:JSON.parse(localStorage.getItem("isSoundEnabled"))===true,

    toggleSound: () => {
        localStorage.setItem("isSoundEnabled",!get().isSoundEnabled)
        set({isSoundEnabled:!get().isSoundEnabled})
    },

    setActiveTab: (tab)=>{
        set({activeTab:tab})
    },

    setSelectedUser: (selectedUser)=>{
        set({selectedUser})
    },

    getAllContacts: async()=>{
        set({isUsersLoading:true})
        try {
            const res = await axiosInstance.get("/messages/contacts");
            set({allContacts:res.data});
        } catch (error) {
            toast.error(error.response.data.message);
            
        }finally{
            set({isUsersLoading:false})
        }
    },
    getMyChatPartners: async() => {
        set({isUsersLoading:true})
        try {
            const res = await axiosInstance.get("/messages/chats");
            set({chats:res.data});
        } catch (error) {
            toast.error(error.response.data.message);
            
        }finally{
            set({isUsersLoading:false})
        }
    },

    getMessagesByUserId: async(userId)=>{
       try {
        set({isMessagesLoading:true})
        const res = await axiosInstance.get(`/messages/${userId}`);
        set({messages:res.data})
       } catch (error) {
        toast.error(error.response?.data?.message || "Something went wrong");
       }finally{
        set({isMessagesLoading:false});
       } 
    },

    sendMessage: async (messageData)=>{
        const {selectedUser, messages} = get();
        const {authUser} = useAuthStore.getState();
        const tempId = `temp-${Date.now()}`;

        const optimisticMessage = {
            _id: tempId,
            senderId: authUser._id,
            receiverId: selectedUser._id,
            text: messageData.text,
            image: messageData.image,
            createdAt : new Date().toISOString(),
            isOptimistic: true, //flag to identify optimistic messages
        }
        //update ui immediately by adding message before processing in db
        set({messages:[...messages, optimisticMessage]});
        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`,messageData);
            set({messages: messages.concat(res.data)})
            
        } catch (error) {
            //remove optimistic message on error
            set({messages:messages})
            toast.error(error.response?.data?.message || "Something went wrong");
        }
    },

    subscribeToMessages:()=>{
        const {selectedUser, isSoundEnabled} = get();
        if(!selectedUser){
            return;
        }
        const socket = useAuthStore.getState().socket;
        
        // Handle new messages
        const handleNewMessage = (newMessage) => {
            const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
            if(!isMessageSentFromSelectedUser){
                return;
            }
            const currentMessages = get().messages;
            set({messages:[...currentMessages, newMessage]});
            if(isSoundEnabled){
                const notificationSound = new Audio("/sounds/notification.mp3");
                notificationSound.currentTime = 0; //reset to start
                notificationSound.play().catch((e)=> console.log("Audio play failed", e));
            }
        };

        // Handle message deletion
        const handleMessageDeleted = ({ messageId }) => {
            const currentMessages = get().messages;
            // Only update if the message exists in the current view
            if (currentMessages.some(msg => msg._id === messageId)) {
                const updatedMessages = currentMessages.filter(msg => msg._id !== messageId);
                set({ messages: updatedMessages });
            }
        };

        // Set up event listeners
        socket.on("newMessage", handleNewMessage);
        socket.on("messageDeleted", handleMessageDeleted);

        // Return cleanup function
        return () => {
            socket.off("newMessage", handleNewMessage);
            socket.off("messageDeleted", handleMessageDeleted);
        };
    },
    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        // Remove all listeners to prevent memory leaks
        socket.off("newMessage");
        socket.off("messageDeleted");
    },
    
    deleteMessage: async (messageId) => {
        const { messages } = get();
        try {
            // Optimistic update - immediately remove the message
            const updatedMessages = messages.filter(msg => msg._id !== messageId);
            set({ messages: updatedMessages });
            
            // API call to delete the message on the server
            const response = await axiosInstance.delete(`/messages/${messageId}`);
            
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to delete message');
            }
            
        } catch (error) {
            // Revert on error by refreshing messages from the server
            const { selectedUser } = get();
            if (selectedUser) {
                get().getMessagesByUserId(selectedUser._id);
            }
            toast.error(error.response?.data?.message || "Failed to delete message");
        }
    },
}))