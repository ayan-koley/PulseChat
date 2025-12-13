import { useDispatch, useSelector } from 'react-redux' 
import './App.css'
import Login from './component/Login.jsx'
import { useEffect, useRef } from 'react';
import axios from 'axios';
import { DB_AUTH_URI, DB_URI } from './constant.js';
import { login } from './store/authSlice.js';
import { io } from 'socket.io-client'

function App() {
  const dispatch = useDispatch();
  const {user, status, accessToken} = useSelector(s => s.auth);
  const socket = useRef(null);

  useEffect(() => {
    const restoreSession = async() => {
      const userData = await axios.post(`${DB_AUTH_URI}/refresh-token`,{}, {withCredentials: true}).then(d => d.data).then(d => d.data);

      dispatch(login(userData));
    }

    if(!status) restoreSession();

    if(status) {
      // make a socket connection
      socket.current = io(`http://localhost:8080`, {
        auth: {
          token: accessToken
        }
      })

      console.log(socket.current);
    }
    
  }, [status])

  return status === true ? (
    <div>
        <h1>Congratulation you'r login</h1>
        {/* <h2>{user.username}</h2> */}
    </div>
  ) : (
    <>
      <Login />
    </>
  )
}

export default App
