import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import {Conversation} from '../models/conversations.models.js';
import {Message} from '../models/message.models.js';

export default function initSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: 'http://localhost:5173',
            credentials: true
        }
    })

    io.use((socket, next) => {
        // handshake provide -> headers, auth data, query param

        try {
            const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(" ")[1];

            if(!token) {
                return next(new Error("Authentication Error: token missing"));
            }

            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

            socket.user = {_id: decoded._id, fullName: decoded.fullName};
            next();

        } catch (error) {
            next(new Error("Authentication Error: Invalid token"));
        }
    })


    io.on('connection', socket => {
        console.log("Socket connected: ", socket.id, "user: ", socket.user?._id);

        io.emit("user:online", { userId: socket.user._id, status: true})


        socket.on('conversation:join', ({conversationId}) => {
            if(!conversationId) return;

            socket.join(conversationId);
            // You can log or emit something if you want
            io.to(conversationId).emit("user_joined", { userId: socket.user._id })

            
        })

        socket.on('message:send', async({conversationId, text}) => {
            try {

                
                if(!conversationId || !text?.trim()) return;
    
                const senderId = socket.user._id;
    
                // validate that user actually belongs to this conversation
                const conv = await Conversation.findById(conversationId);

    
                if(!conv || !conv?.participants.some(p => p._id.toString() === senderId.toString())) return;

    
                // create message
                const message = await Message.create({
                    sender: senderId,
                    text,
                    conversation: conv._id
                })
    
                // update lastmessage to conversation model
                await Conversation.findByIdAndUpdate(conversationId, {
                    lastMessage: message._id,
                    lastMessageAt: message.createdAt
                })
    
                // send message payload to the user
                const messagePayload = {
                    _id: message._id,
                    text: message.text,
                    sender: {
                        _id: message.sender,
                        fullName: socket.user.fullName
                    },
                    conversation: conversationId,
                    createdAt: message.createdAt
                }
    
                io.to(conversationId).emit("message:new", messagePayload)
            } catch (err) {
                console.error("message:send error ", err.message);
                socket.to(conversationId).emit({type: "MESSAGE_SEND_FAILED", message: "Failed to send message"});
            }
        })

        socket.on('disconnect', () => {
            console.log("Socket disconnected: ", socket.id);
            io.emit("user:offline", { userId: socket.user._id, status: false})
        })
    })

    return io;
}
