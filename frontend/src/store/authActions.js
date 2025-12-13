import { DB_AUTH_URI } from '../constant.js';
import { login, logout } from './authSlice.js';
import axios from 'axios';

export const loginUser = (credentials) => async(dispatch) => {
    try {
        // doing database call 
        const userData = await axios.post(`${DB_AUTH_URI}/login`, {
            email: credentials.email,
            password: credentials.password
        },
        {
            withCredentials: true
        }
    ).then(d => d.data).then(d => d.data);


        dispatch(login(userData));
    } catch (err) {
        console.error('ERROR ON LOGIN :: ', err.message);
    }
}

export const getCurrentUser = () => async(dispatch) => {
    try {
        const userData = await axios.get(`${DB_AUTH_URI}/current-user`).then(d => d.data).then(d => d.data);
        dispatch(login(userData));
    } catch (err) {
        console.error('ERROR on fetching current user details :: ', err.message);
    }
}