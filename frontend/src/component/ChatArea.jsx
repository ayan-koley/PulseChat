import axios from "axios";
import { useEffect, useState } from "react";
import { DB_URI } from '../constant.js';
import { useSelector } from "react-redux";
import { socket } from '../socket.js';

const ChatArea = ({conversationId}) => {

  const[messages, setMessages] = useState([]);
  const[messageText, setMessageText] = useState("");
  const {user: loginUser} = useSelector(s => s.auth);

  // fetch all message by this conversation id
  useEffect(() => {
    const fetchMessages = async() => {
      try {
        const response_messages = await axios.get(`${DB_URI}/message/${conversationId}`, {
          withCredentials: true
        })
        .then(d => d.data)
        .then(d => d.data)
        .then(d => d.messages);

        if(!response_messages) {
          console.error("response_message is undefined");
        }

        console.log('does it work ?');
        setMessages(response_messages);
        console.log(messages);
      } catch (err) {
        console.error("ERROR on fetching message ", err.message);
      }
    }
    if(messages.length == 0 )fetchMessages();
  }, [])

  const sendMessage = () => {
    
    if(!messageText && messageText.trim() === '') {
      console.error('undefined text');
      return;
    }
    
    socket.emit('message:send', {conversationId, text:messageText});
    setMessageText("");
  }

  useEffect(() => {
    socket.on("message:new", ( messagePayload ) => {
      console.log('socket returning value ', messagePayload);
      setMessages((prev) => [...prev, messagePayload]);
    })
  }, [])

  return (
    <div className="h-screen w-full flex flex-col bg-neutral-900 text-white">
      
      {/* Header (optional) */}
      <div className="h-14 px-4 flex items-center border-b border-neutral-800">
        <h2 className="font-semibold">Chat</h2>
      </div>

      {/* Messages area (scrollable) */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length == 0 ? (
          <div className="text-center text-amber-300">
            🔐Start your chat
          </div>
        ) : 
        messages.map(msg => (
          <div className={` w-fit ${msg.sender._id == loginUser._id ? 'bg-blue-600 self-end ml-auto' : 'bg-neutral-800 self-start'}  px-3 py-2 rounded-lg`} key={msg._id}>
            {msg.text}
          </div>
        ))
          }
      </div>

      {/* Input box (fixed at bottom) */}
      <form className="w-full h-16 border-t border-neutral-800 px-4 flex-1 items-center bg-neutral-900" onSubmit={(e) => {
        e.preventDefault();
        sendMessage();
      }}>
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 bg-neutral-800 text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
        />

        <button type="submit" className="ml-3 bg-blue-600 hover:bg-blue-700 px-4 py-2  cursor-pointer rounded-lg">
          Send
        </button>

      </form>
    </div>
  );
};

export default ChatArea;