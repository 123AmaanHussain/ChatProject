import React, { useEffect } from 'react'
import { useChatStore } from '../store/useChatStore.js';
import { useAuthStore } from '../store/useAuthStore.js';
import ChatHeader from './ChatHeader.jsx';
import NoChatHistoryPlaceHolder from './NoChatHistoryPlaceHolder.jsx';
import MessagesLoadingSkeleton from './MessagesLoadingSkeleton.jsx';

function ChatContainer() {
  const { selectedUser, getMessagesByUserId, messages, isMessagesLoading } = useChatStore();
  const { authUser } = useAuthStore();
  useEffect(() => {
    if (selectedUser) {
      getMessagesByUserId(selectedUser._id);
    }
  }, [selectedUser, getMessagesByUserId])
  return (
    <>
      <ChatHeader />
      <div className='flex-1 overflow-y-auto px-6 py-8'>
        {messages.length > 0 && !isMessagesLoading ? (
          <div className='max-w-3xl mx-auto space-y-6'>
            {messages.map(msg => (
              <div key={msg._id}
                className={`chat ${msg.sender._id === authUser._id ? 'chat-right' : 'chat-left'}`}
              >
                <div
                  className={`chat-bubble relative ${msg.senderId === authUser._id
                      ? "bg-cyan-600 text-white"
                      : "bg-slate-800 text-slate-200"
                    }`}
                >
                  {msg.image && (
                    <img src={msg.image} alt="Shared" className="rounded-lg h-48 object-cover" />
                  )}
                  {msg.text && <p className="mt-2">{msg.text}</p>}
                  <p className="text-xs mt-1 opacity-75 flex items-center gap-1">
                    {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

              </div>
            ))}

          </div>
        ) : isMessagesLoading ? <MessagesLoadingSkeleton /> : (
          <NoChatHistoryPlaceHolder name={selectedUser.fullName} />
        )}

      </div>
    </>
  )
}

export default ChatContainer