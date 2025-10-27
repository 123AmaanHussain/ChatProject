import React, { useEffect, useRef } from 'react'
import { useChatStore } from '../store/useChatStore.js';
import { useAuthStore } from '../store/useAuthStore.js';
import ChatHeader from './ChatHeader.jsx';
import NoChatHistoryPlaceHolder from './NoChatHistoryPlaceHolder.jsx';
import MessagesLoadingSkeleton from './MessagesLoadingSkeleton.jsx';
import MessageInput from './MessageInput.jsx';

function ChatContainer() {
  const { selectedUser, getMessagesByUserId, messages, isMessagesLoading } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  useEffect(() => {
    if (selectedUser) {
      getMessagesByUserId(selectedUser._id);
    }
  }, [selectedUser, getMessagesByUserId]);

  useEffect(() => {
    if(messageEndRef.current){
        messageEndRef.current.scrollIntoView({behavior:"smooth"})
    }
  },[messages])
  return (
    <>
      <ChatHeader />
      <div className='flex-1 overflow-y-auto px-6 py-8'>
        {messages.length > 0 && !isMessagesLoading ? (
          <div className='max-w-3xl mx-auto space-y-6'>
            {messages.map(msg => (
              <div key={msg._id}
                className={`chat ${msg.senderId === authUser._id ? 'chat-end' : 'chat-start'}`}
              >
                <div
                  className={`chat-bubble text-white ${msg.senderId === authUser._id
                      ? "chat-bubble-primary bg-cyan-600"
                      : "bg-slate-800"
                    }`}
                >
                  {msg.image && (
                    <img src={msg.image} alt="Shared" className="rounded-lg w-full h-48 object-cover mb-2" />
                  )}
                  {msg.text && <p>{msg.text}</p>}
                  <p className="text-xs mt-1 opacity-75 flex items-center gap-1">
                    {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

              </div>
            ))}
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