import React, { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../store/useChatStore.js';
import { useAuthStore } from '../store/useAuthStore.js';
import ChatHeader from './ChatHeader.jsx';
import NoChatHistoryPlaceHolder from './NoChatHistoryPlaceHolder.jsx';
import MessagesLoadingSkeleton from './MessagesLoadingSkeleton.jsx';
import MessageInput from './MessageInput.jsx';
import { FaTrash, FaEllipsisV } from 'react-icons/fa';

function ChatContainer() {
  const { selectedUser, getMessagesByUserId, messages, isMessagesLoading, subscribeToMessages, unsubscribeFromMessages, deleteMessage } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(null);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (selectedUser) {
      getMessagesByUserId(selectedUser._id);
      subscribeToMessages();

      // Cleanup
      return () => {
        unsubscribeFromMessages();
      };
    }
  }, [selectedUser, getMessagesByUserId, subscribeToMessages, unsubscribeFromMessages]);

  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteMessage(messageId);
      setMenuOpen(null);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  useEffect(() => {
    if(messageEndRef.current){
        messageEndRef.current.scrollIntoView({behavior:"smooth"})
    }
  },[messages]);

  return (
    <>
      <ChatHeader />
      <div className='flex-1 overflow-y-auto px-6 py-8'>
        {messages.length > 0 && !isMessagesLoading ? (
          <div className='max-w-3xl mx-auto space-y-6'>
            {messages.map((msg, index) => {
              const isCurrentUser = msg.senderId === authUser._id;
              const showSender = index === 0 || 
                messages[index - 1].senderId !== msg.senderId || 
                (new Date(msg.createdAt) - new Date(messages[index - 1].createdAt) > 5 * 60 * 1000);
              
              return (
                <div 
                  key={msg._id}
                  className={`chat ${isCurrentUser ? 'chat-end' : 'chat-start'}`}
                >
                  {!isCurrentUser && showSender && (
                    <div className="chat-header text-sm font-medium text-gray-400 mb-1 ml-2">
                      {selectedUser.fullName}
                    </div>
                  )}
                  
                  <div className="relative group">
                    <div
                      className={`chat-bubble text-white ${isCurrentUser
                        ? "chat-bubble-primary bg-cyan-600"
                        : "bg-slate-800"
                      }`}
                    >
                      {msg.image && (
                        <img src={msg.image} alt="Shared" className="rounded-lg w-full h-48 object-cover mb-2" />
                      )}
                      {msg.text && <p>{msg.text}</p>}
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs opacity-75">
                          {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        {isCurrentUser && (
                          <div className="relative" ref={menuRef}>
                            <button 
                              onClick={() => setMenuOpen(menuOpen === msg._id ? null : msg._id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 text-xs p-1 hover:bg-black/20 rounded-full"
                            >
                              <FaEllipsisV size={12} />
                            </button>
                            
                            {menuOpen === msg._id && (
                              <div className="absolute right-0 bottom-6 bg-slate-800 rounded-lg shadow-lg py-1 z-10">
                                <button
                                  onClick={() => handleDeleteMessage(msg._id)}
                                  className="flex items-center px-4 py-2 text-sm text-red-400 hover:bg-slate-700 w-full text-left"
                                >
                                  <FaTrash className="mr-2" /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messageEndRef}/>

          </div>
        ) : isMessagesLoading ? <MessagesLoadingSkeleton /> : (
          <NoChatHistoryPlaceHolder name={selectedUser.fullName} />
        )}

      </div>
      <MessageInput />
    </>
  )
}

export default ChatContainer