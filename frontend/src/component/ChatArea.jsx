import { useEffect, useRef, useState } from "react";
import avatar from '../../public/avatar.png'

const formatTime = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const getDisplayMeta = (conversation, loggedInUserId) => {
  if (!conversation) return { name: "", avatar: "" };
  if (conversation.isGroup) {
    return {
      name: conversation.name || "Group Chat",
      avatar: conversation.avatar || conversation.participants?.[0]?.avatar,
    };
  }
  const other = conversation.participants?.find(
    (p) => p._id !== loggedInUserId
  );
  return {
    name: other?.fullName || "Chat",
    avatar: other?.avatar,
  };
};

const ChatHeader = ({ conversation, loggedInUserId }) => {
  const meta = getDisplayMeta(conversation, loggedInUserId);
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/80">
      <div className="flex items-center gap-3">
        <img
          src={avatar}
          alt={meta.name}
          className="w-10 h-10 rounded-full object-cover bg-neutral-800"
        />
        <div>
          <p className="text-sm font-semibold text-neutral-100">{meta.name}</p>
          <p className="text-xs text-neutral-400">typing…</p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-neutral-400">
        <button
          className="p-2 rounded-full hover:bg-neutral-800"
          aria-label="Search in chat"
        >
          🔍
        </button>
        <button
          className="p-2 rounded-full hover:bg-neutral-800"
          aria-label="Start call"
        >
          📞
        </button>
        <button
          className="p-2 rounded-full hover:bg-neutral-800"
          aria-label="More options"
        >
          ⋯
        </button>
      </div>
    </header>
  );
};

const MessageBubble = ({ message, isMine, showName, isGroup }) => {
  const bubbleClasses = isMine
    ? "bg-blue-500 text-white"
    : "bg-neutral-800 text-neutral-100";

  return (
    <div
      className={`flex flex-col ${isMine ? "items-end" : "items-start"} gap-1`}
    >
      {showName && !isMine && (
        <span className="text-[11px] text-neutral-400">
          {message.sender.fullName}
        </span>
      )}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm ${bubbleClasses}`}
      >
        {message.messageType === "image" && message.attachments?.length ? (
          <div className="flex flex-col gap-2">
            {message.text && <p className="leading-relaxed">{message.text}</p>}
            <div className="grid grid-cols-2 gap-2">
              {message.attachments.map((img, idx) => (
                <img
                  key={idx}
                  src={img.url}
                  alt="Shared"
                  className="w-full h-28 object-cover rounded-xl"
                />
              ))}
            </div>
          </div>
        ) : (
          <p className="leading-relaxed">{message.text}</p>
        )}
      </div>
      <span className="text-[11px] text-neutral-500">
        {formatTime(message.createdAt)}
      </span>
    </div>
  );
};

const MessageList = ({ messages, loggedInUserId, isGroup }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-6 py-6 bg-neutral-900"
    >
      <div className="flex flex-col gap-4">
        {messages.map((message) => {
          const isMine = message.sender._id === loggedInUserId;
          return (
            <MessageBubble
              key={message._id}
              message={message}
              isMine={isMine}
              isGroup={isGroup}
              showName={isGroup}
            />
          );
        })}
      </div>
    </div>
  );
};

const MessageInput = ({ onSend }) => {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-neutral-800 bg-neutral-900 px-4 py-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setText((val) => val + "😊")}
          className="p-2 rounded-full hover:bg-neutral-800"
          aria-label="Add emoji"
        >
          😊
        </button>
        <button
          type="button"
          className="p-2 rounded-full hover:bg-neutral-800"
          aria-label="Attach file"
        >
          📎
        </button>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message"
          className="flex-1 min-h-[44px] max-h-28 rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={handleSend}
          className="h-11 w-11 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition"
          aria-label="Send message"
        >
          📨
        </button>
      </div>
    </div>
  );
};

const ChatArea = ({
  activeConversation,
  messages = [],
  onSendMessage,
  loggedInUserId,
}) => {
  if (!activeConversation) {
    return (
      <section className="flex items-center justify-center bg-neutral-950">
        <p className="text-neutral-400">
          Select a conversation to start chatting
        </p>
      </section>
    );
  }

  const isGroup = Boolean(activeConversation.isGroup);

  return (
    <section className="flex flex-col h-full bg-neutral-900">
      <ChatHeader
        conversation={activeConversation}
        loggedInUserId={loggedInUserId}
      />
      <MessageList
        messages={messages}
        loggedInUserId={loggedInUserId}
        isGroup={isGroup}
      />
      <MessageInput onSend={onSendMessage} />
    </section>
  );
};

export default ChatArea;
