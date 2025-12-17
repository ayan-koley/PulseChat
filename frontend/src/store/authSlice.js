import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    user: null,
    status: false,
    accessToken: null,
    error: null
};


const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action) => {
            state.status = true;
            state.user = action.payload.user;
            state.accessToken = action.payload.accessToken;
        },
        logout: (state, action) => {
            state.status = false;
            state.user = null;
            state.token = null;
        }
    }
})

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;