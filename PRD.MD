# Real-Time Chat Application – PRD

## 1. Overview

The Real-Time Chat Application is a **1:1 messaging platform** that allows authenticated users to:

- Discover or select other users
- Start conversations
- Exchange real-time text messages
- View chat history
- See basic online/last-seen indicators (MVP: optional last-seen, “online” via socket connection)

This PRD focuses on the **backend**: REST APIs, WebSocket/Socket.IO events, and database design.  
Frontend is considered a separate concern but will consume these APIs and events.

---

## 2. Goals & Non-Goals

### 2.1 Goals (MVP)

1. **User Authentication**
   - Register with username, email, password
   - Login with email/username + password
   - Issue JWT for authenticated requests

2. **1:1 Conversations**
   - Create a conversation between two users
   - Reuse existing conversation if already created
   - List all conversations for the logged-in user

3. **Real-Time Messaging**
   - Send messages in real-time using WebSockets (Socket.IO)
   - Persist messages in database
   - Broadcast new messages to all participants in a conversation

4. **Message History**
   - Fetch paginated message history for a conversation
   - Messages ordered by creation time

5. **Online Status (Basic)**
   - Track which users are online using Socket.IO connections (in-memory)
   - Optionally expose online status via socket events (not persisted)

### 2.2 Non-Goals (for MVP)

These may come in later versions but **not required** for initial release:

- Group chats (more than 2 participants)
- Media/file attachments
- Push notifications (mobile or browser)
- Typing indicators (`user is typing...`)
- Read receipts (`seen at...`)
- Message reactions (like, emoji, etc.)
- End-to-end encryption
- Search messages by text

---

## 3. Target Users & Personas

1. **Regular User**
   - Wants a simple, fast chat with other registered users.
   - Uses web UI (or mobile app) to sign in, see a list of contacts, and chat.

2. **Admin / Developer (Internal)**
   - Needs backend that is modular and easy to extend (group chat, file sharing).
   - Wants clear API contracts and database schema.

---

## 4. High-Level User Flows

### 4.1 Registration / Login

1. User registers with username, email, password.
2. System validates uniqueness and stores hashed password.
3. On success, return user object + JWT.
4. User logs in with email/username + password.
5. System validates credentials and returns JWT.

### 4.2 Start a New Chat

1. Authenticated user selects another user to chat with.
2. Client calls `POST /api/conversations/:otherUserId`.
3. Backend checks if a conversation between these two users already exists.
   - If exists → return existing conversation.
   - If not → create a new conversation document.
4. Client then opens this conversation.

### 4.3 Real-Time Messaging

1. Client connects to Socket.IO with JWT token.
2. Client joins a room identified by `conversationId`.
3. When user sends a message:
   - Client emits `message:send` with `{ conversationId, text }`.
   - Backend:
     - Validates user is a participant.
     - Creates a `Message` document.
     - Updates conversation’s `lastMessageAt`.
     - Emits `message:new` to room `conversationId`.
4. All clients in that conversation room receive the new message in real-time.

### 4.4 Viewing Conversation List & History

1. Client calls `GET /api/conversations` to list user’s conversations.
2. For each conversation, show participants and last activity time.
3. When user opens a conversation:
   - Client calls `GET /api/messages/:conversationId` (with optional pagination).
4. Messages are displayed ordered by `createdAt`.

---

## 5. Functional Requirements

### 5.1 Authentication

- **Register**
  - Endpoint: `POST /api/auth/register`
  - Body: `{ username, email, password }`
  - Returns: `{ user, token }`

- **Login**
  - Endpoint: `POST /api/auth/login`
  - Body: `{ emailOrUsername, password }`
  - Returns: `{ user, token }`

- **Auth Middleware**
  - Accepts `Authorization: Bearer <token>`
  - Sets `req.user` if valid.

### 5.2 Conversations

- **Create/Get 1-1 Conversation**
  - Endpoint: `POST /api/conversations/:otherUserId`
  - Auth required.
  - If conversation with these two participants exists → return it.
  - Else create new conversation.

- **List User Conversations**
  - Endpoint: `GET /api/conversations`
  - Returns list of conversations where user is a participant.

### 5.3 Messages

- **Fetch Messages**
  - Endpoint: `GET /api/messages/:conversationId`
  - Auth required.
  - User must be participant.
  - Returns messages sorted by createdAt (ASC).
  - Support query params for pagination (optional): `?limit=50&before=<timestamp>`.

- **Send Message (Socket.IO)**
  - Event: `message:send`
  - Payload: `{ conversationId: string, text: string }`
  - Auth via socket handshake.
  - Server emits `message:new` with the created message.

### 5.4 Socket.IO Events (MVP)

- **Client → Server**
  - `conversation:join`: join a room for `conversationId`.
    - Payload: `{ conversationId }`
  - `message:send`: send message.
    - Payload: `{ conversationId, text }`

- **Server → Client**
  - `message:new`: new message broadcast to conversation room.
  - `user:online` / `user:offline` (optional): when user connects/disconnects.

---

## 6. Non-Functional Requirements

- **Performance**
  - Should handle at least a few hundred concurrent connections on MVP.
- **Security**
  - Passwords must be hashed (BCrypt).
  - JWT must use secure secret and expiry (e.g., 7 days).
- **Scalability**
  - Stateless REST services; Socket.IO may later use adapter (e.g., Redis) if horizontally scaled.
- **Reliability**
  - Messages must be written to DB before sending confirmation to clients.
- **Observability**
  - Basic logs for API calls, socket connections, and error cases.

---

## 7. Technology Stack (Backend)

- **Runtime**: Node.js
- **Framework**: Express.js
- **Real-Time**: Socket.IO
- **Database**: MongoDB (Mongoose ODM)
- **Auth**: JWT (JSON Web Tokens)
- **Config**: dotenv
- **Password Hashing**: bcrypt

---

## 8. Database Schema

### 8.1 Data Modeling Overview

We use MongoDB with the following core collections:

1. `users`
2. `conversations`
3. `messages`

Optional future collections (not in MVP, just noted):

- `groups` (for group chat)
- `message_status` (for per-user read receipts)

---

### 8.2 Users Collection

**Collection name:** `users`

Represents a registered user in the system.

#### Fields

| Field        | Type                       | Required | Unique | Description                                   |
|-------------|----------------------------|----------|--------|-----------------------------------------------|
| `_id`       | `ObjectId`                 | Yes      | Yes    | Primary key                                   |
| `username`  | `String`                   | Yes      | Yes    | Public username                               |
| `email`     | `String`                   | Yes      | Yes    | User email (used for login)                  |
| `password`  | `String` (hashed)          | Yes      | No     | Hashed password (bcrypt)                     |
| `avatarUrl` | `String`                   | No       | No     | URL to profile picture (optional)            |
| `createdAt` | `Date`                     | Yes      | No     | Auto-managed by Mongoose                     |
| `updatedAt` | `Date`                     | Yes      | No     | Auto-managed by Mongoose                     |


### Conversation

| Field          | Type                          | Required | Unique | Description                                                       |
|----------------|-------------------------------|----------|--------|-------------------------------------------------------------------|
| `_id`          | `ObjectId`                    | Yes      | Yes    | Primary key                                                       |
| `participants` | `Array<ObjectId>` (ref: User) | Yes      | No     | List of user IDs in this conversation (for 1-1 or group chats)   |
| `isGroup`      | `Boolean`                     | Yes      | No     | `false` for 1-1 chat, `true` for group chat                      |
| `groupName`    | `String`                      | No       | No     | Name of the group (only used when `isGroup = true`)              |
| `lastMessage`  | `ObjectId` (ref: Message)     | No       | No     | Reference to the latest message in this conversation             |
| `lastMessageAt`| `Date`                        | No       | No     | Timestamp of the latest message (for sorting conversation list)  |
| `createdAt`    | `Date`                        | Yes      | No     | Auto-managed by Mongoose (conversation creation time)            |
| `updatedAt`    | `Date`                        | Yes      | No     | Auto-managed by Mongoose (last update time)                      |

### Message

| Field          | Type                          | Required | Unique | Description                                                       |
|----------------|-------------------------------|----------|--------|-------------------------------------------------------------------|
| `_id`          | `ObjectId`                    | Yes      | Yes    | Primary key                                                       |
| `conversation` | `ObjectId` (ref: Conversation)| Yes      | No     | The conversation this message belongs to                          |
| `sender`       | `ObjectId` (ref: User)        | Yes      | No     | User ID of the sender                                             |
| `text`         | `String`                      | No       | No     | Text content of the message (optional if only attachments)        |
| `attachments`  | `Array<Object>`              | No       | No     | File metadata (URLs, types, sizes) if you support media/files     |
| `status`       | `String`                      | Yes      | No     | Message status: `"sent" | "delivered" | "read"`                    |
| `createdAt`    | `Date`                        | Yes      | No     | Auto-managed by Mongoose (send time)                             |
| `updatedAt`    | `Date`                        | Yes      | No     | Auto-managed by Mongoose (edit/read status updates)              |

