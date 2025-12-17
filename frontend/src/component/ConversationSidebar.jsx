import { useEffect, useState } from "react";
import { useDebounce } from "../utils/useDebounce.js";
import axios from "axios";
import { DB_URI } from "../constant.js";
import { useSelector } from "react-redux";
import UserItem from "./UserItem.jsx";
import { socket } from "../socket.js";
import { timeFormater } from '../utils/timeFormater.js'

export default function ConversationSidebar({ onSelectConversation, selectedConversationId }) {
  const [activeId, setActiveId] = useState("c1");
  const { accessToken, status } = useSelector((s) => s.auth);

  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const debounceQuery = useDebounce(query, 500);


  const[listUserConversation, setListUserConversation] = useState([]);
  const { user: loginUser } = useSelector(s => s.auth);


  useEffect(() => {
    if (!debounceQuery.trim()) {
      setUsers([]);
      return;
    }

    const searchApiCall = async () => {
      try {
        const users = await axios
          .post(
            `${DB_URI}/user/search`,
            {
              query: debounceQuery,
            },
            {
              withCredentials: true,
            }
          )
          .then((d) => d.data)
          .then((d) => d.data)
          .then((d) => d.users);

        setUsers(users);
      } catch (err) {
        console.error("serching user error ::: ", err.message);
      }
    };

    searchApiCall();
  }, [debounceQuery]);


  const joinConversation = async(otherUserId) => {
    try {
      const conversation = await axios.post(`${DB_URI}/conversation/${otherUserId}`, {}, {
        withCredentials: true
      }).then(d => d.data).then(d => d.data).then(d => d.conversation);
      
      socket.emit("conversation:join", { conversationId: conversation._id });

    } catch (error) {
      console.error("ERROR on joining user ", error.message);
    }
  }

  useEffect(() => {
    if(!socket) return;

    socket.on("user_joined", ({userId}) => {
      console.log("User joined:", userId);
    })

    return () => socket.off('user_joined');
  }, [])

  useEffect(() => {
    // fetch list of conversations
    const fetchListOfConversations = async() => {
      try {
        const response = await axios.get(`${DB_URI}/conversation`, {
          withCredentials: true
        }).then(d => d.data).then(d => d.data).then(d => d.listConversations);

        if(!response) {
          console.error('Response is undefined');
        }

        setListUserConversation(response);
      } catch (err) {
        console.error("ERROR on fetching conversations ", err.message);
      }
    }
    // store in a state and based on state list message conversations
    if(status) fetchListOfConversations();
  }, [status])


  return (
    <div className="w-96 h-screen bg-neutral-900 border-r border-neutral-800 flex flex-col">
      {/* Header */}
      {/* <div className="p-4 font-semibold text-lg border-b border-neutral-800 text-neutral-100">
        Conversations
      </div> */}

      {/* Search */}
      <div className="p-3 border-b border-neutral-800">
        <input
          type="text"
          placeholder="Search users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-neutral-800 bg-neutral-950 text-neutral-100 placeholder:text-neutral-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
      </div>

      {/* Search Results */}
      {users.length > 0 && (
        <div className="border-b border-neutral-800">
          <p className="text-xs font-medium text-neutral-400 px-3 py-2">
            Search Results
          </p>
          <div className="px-2 space-y-1 max-h-64 overflow-y-auto">
            {users.map((user) => (
              <div key={user._id} onClick={() => joinConversation(user._id)}>
                <UserItem
                user={user}
              />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {listUserConversation.length > 0 && listUserConversation.map((conv) => {
          // const isActive = conv._id === activeId;

          
          const [recievingUser] = conv?.participants?.filter(p_user => p_user._id !== loginUser._id);

          console.log(conv.lastMessage);

          return (
            <div
              key={conv._id}
              onClick={() => {
                joinConversation(recievingUser._id);
                onSelectConversation(conv._id);
              }} 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200
                ${selectedConversationId === conv._id && 'bg-gray-600'}
                
                `
                /**
                  ${
                  isActive
                    ? "bg-blue-900/30 border border-blue-700/50"
                    : "border border-transparent hover:bg-neutral-800/60 hover:border-neutral-700/40"
                }
                 */

              }
            >
              {/* Avatar */}
              <img
                src={recievingUser.avatar.url}
                alt={recievingUser.fullName}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-neutral-700/50"
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <p className="font-medium truncate text-neutral-100">
                    {recievingUser.fullName}
                  </p>
                  <span className="text-xs text-neutral-500">
                    {timeFormater(conv.lastMessageAt)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-sm text-neutral-400 truncate">
                    {conv?.lastMessage?.text}
                  </p>

                  {/* {conv.unreadCount > 0 && (
                    <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full flex-shrink-0">
                      {conv.unreadCount}
                    </span>
                  )} */}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
