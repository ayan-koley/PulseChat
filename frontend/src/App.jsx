import { useDispatch, useSelector } from "react-redux";
import "./App.css";
import Login from "./component/Login.jsx";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { DB_AUTH_URI, DB_URI } from "./constant.js";
import { login } from "./store/authSlice.js";
import { io } from "socket.io-client";
import ConversationSidebar from "./component/ConversationSidebar.jsx";
import ChatArea from "./component/ChatArea.jsx";
import { socket } from "./socket.js";

function App() {
  const dispatch = useDispatch();
  const { user, status, accessToken } = useSelector((s) => s.auth);
  const [selectedConversationId, setSelectedConversationId] = useState(null);

  // useEffect(() => {
  //   const restoreSession = async () => {
  //     const userData = await axios
  //       .post(`${DB_AUTH_URI}/refresh-token`, {}, { withCredentials: true })
  //       .then((d) => d.data)
  //       .then((d) => d.data);

  //       console.log(userData);

  //     dispatch(login(userData));
  //   };

  //   if (!status) restoreSession();

  // }, [status]);


  useEffect(() => {
    if(status && user !== null) {
      

      socket.auth = {
        token: accessToken
      }
      socket.connect();

     socket.on('connect', () => {
      console.log('Socket connected ::: ', socket.id);
     })

     socket.on('user:online', (userId, status) => {
      console.log("User is online :: ", userId, " ", status);
     })
    } 

    // return () => {
    //   socket.disconnect();
    // }
  }, [status, user])

  useEffect(() => {
    const currentUser = async() => {
      try {
        const userData = await axios.get(`${DB_AUTH_URI}/current-user`, {
          withCredentials: true
        })
        .then(d => d.data)
        .then(d => d.data);

        dispatch(login(userData));
      } catch (err) {
        console.error("ERROR on fetching current user ", err.message);
      }
    }

    if(!status) {
      currentUser();
    }
  })

  return status === true ? (
    
      <div className="h-screen">
        <div className="p-4 font-semibold text-lg border-b border-neutral-800 text-neutral-100">
          Conversations
        </div>
        <div className="flex">
          <ConversationSidebar onSelectConversation={setSelectedConversationId} selectedConversationId={selectedConversationId} />
          {selectedConversationId === null ? (
            <div className="w-full text-white flex justify-center items-center">
              <p className="font-bold text-5xl">Hii, Welcome to PulseChat 😃</p>
            </div>
          ) : (
                <ChatArea conversationId={selectedConversationId} />
          )}
        </div>
      </div>
  ) : (
    <>
      <Login />
    </>
  );
}

export default App;
