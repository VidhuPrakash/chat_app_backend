# Chat App Backend
This repository contains the backend service for a real-time chat application. It is built with Node.js, Express, MongoDB, and Socket.IO, providing a robust foundation for handling user authentication, one-on-one messaging, and group chats.

## Features

-   **User Authentication**: Secure user registration and login using JWT (JSON Web Tokens).
-   **Real-time Messaging**: Instant one-on-one and group messaging powered by Socket.IO.
-   **User Presence**: Real-time tracking of online/offline user status.
-   **Message History**: Ability to fetch complete chat history for both private and group chats.
-   **Group Management**: Create new groups, join existing groups, and view a list of all available groups.
-   **Typing Indicators**: Shows when a user is typing a message in a one-on-one chat.
-   **Read Receipts**: Track if messages have been read by recipients, implemented for both one-on-one and group chats.
-   **RESTful API**: A well-structured API for managing users, messages, and groups.
-   **Validation**: Robust server-side request validation using Joi.

## Tech Stack

-   **Backend**: Node.js, Express.js
-   **Database**: MongoDB with Mongoose
-   **Real-time Communication**: Socket.IO
-   **Authentication**: JSON Web Token (`jsonwebtoken`), `bcryptjs` for password hashing
-   **Validation**: Joi
-   **Environment Variables**: dotenv
-   **CORS**: cors

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v14 or newer)
-   [npm](https://www.npmjs.com/)
-   [MongoDB](https://www.mongodb.com/) (local instance or a cloud service like MongoDB Atlas)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/Vidhuprakash/chat_app_backend.git
    cd chat_app_backend
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add the following variables.

    ```env
    # Server configuration
    PORT=4000
    
    # MongoDB connection string
    MONGO_URI=your_mongodb_connection_string
    
    # URL of the client application for CORS
    CLIENT_URL=http://localhost:3000
    
    # JWT configuration
    JWT_SECRET=your_super_secret_jwt_key
    AUTH_TOKEN_COOKIE=auth_token
    ```

### Running the Server

-   To run the server in development mode with hot-reloading:
    ```sh
    npm run dev
    ```

-   To run the server in production mode:
    ```sh
    npm start
    ```

The server will be running on `http://localhost:4000` (or the port you specified in your `.env` file).

## Project Structure

The application is organized into a modular structure to promote separation of concerns and maintainability.

```
src/
├── config/             # Database, Socket.IO, and response message configurations
├── exceptions/         # Custom error classes
├── modules/            # Core application logic divided by feature
│   ├── auth/           # Authentication logic (login, register)
│   ├── group/          # Group chat management
│   ├── message/        # One-on-one and group messaging logic
│   └── user/           # User management
├── router/             # Main application router
└── utils/              # Helper functions and utilities
```

## API Endpoints

The following are the available REST API endpoints. All routes are prefixed with `/api`. Authentication is required for all endpoints except `login` and `register`.

| Method | Endpoint                       | Description                               |
| :----- | :----------------------------- | :---------------------------------------- |
| `POST` | `/auth/register`               | Registers a new user.                     |
| `POST` | `/auth/login`                  | Logs in a user and returns a JWT.         |
| `POST` | `/auth/logout`                 | Clears the authentication cookie.         |
| `GET`  | `/users`                       | Gets a list of all registered users.      |
| `GET`  | `/messages/:receiver`          | Gets chat history with a specific user.   |
| `GET`  | `/messages/group/:groupId`     | Gets chat history for a specific group.   |
| `PATCH`| `/messages/:messageId/read`    | Marks a one-on-one message as read.       |
| `GET`  | `/groups`                      | Gets a list of all available groups.      |

## Socket.IO Events

The application uses Socket.IO for real-time bidirectional communication between the client and server.

### Client Emits (to Server)

| Event                  | Payload                                        | Description                                        |
| :--------------------- | :--------------------------------------------- | :------------------------------------------------- |
| `getGroups`            | -                                              | Requests the list of all available groups.         |
| `createGroup`          | `{ name: string }`                             | Creates a new group with the given name.           |
| `joinGroup`            | `{ groupId: string }`                          | Adds the current user to a specific group.         |
| `getChatHistory`       | `{ receiver: string }`                         | Requests one-on-one chat history with another user.|
| `getGroupChatHistory`  | `{ groupId: string }`                          | Requests the chat history of a group.              |
| `sendUserMessage`      | `{ receiver: string, message: string }`        | Sends a message to a specific user.                |
| `sendGroupMessage`     | `{ groupId: string, message: string }`         | Sends a message to a group.                        |
| `markAsRead`           | `{ messageId: string, isGroup: boolean }`      | Marks a specific message as read.                  |
| `typing`               | `{ receiverId: string }`                       | Notifies that the user has started typing.         |
| `stopTyping`           | `{ receiverId: string }`                       | Notifies that the user has stopped typing.         |

### Server Emits (to Client)

| Event                 | Payload                                                              | Description                                                                  |
| :-------------------- | :------------------------------------------------------------------- | :--------------------------------------------------------------------------- |
| `userStatus`          | `Array<{ _id, username, online }>`                                   | Broadcasts the online status of all users to all connected clients.          |
| `groupList`           | `Array<{ id, name }>`                                                | Sends the list of all available groups.                                      |
| `chatHistory`         | `Array<Message>`                                                     | Sends the requested one-on-one chat history.                                 |
| `groupChatHistory`    | `Array<GroupMessage>`                                                | Sends the requested group chat history.                                      |
| `messageSent`         | `Message` or `GroupMessage`                                          | Confirms to the sender that their message was sent successfully.             |
| `receiveMessage`      | `Message`                                                            | Delivers a new one-on-one message to the recipient.                          |
| `receiveGroupMessage` | `GroupMessage`                                                       | Delivers a new group message to all members of the group.                    |
| `messageRead`         | `{ messageId, read }` or `{ messageId, readBy }`                     | Notifies that a message has been read.                                       |
| `userTyping`          | `{ sender, username }`                                               | Informs a client that another user is typing to them.                        |
| `userStoppedTyping`   | `{ sender }`                                                         | Informs a client that another user has stopped typing.                       |
| `error`               | `{ message: string }`                                                | Sends an error message to the client (e.g., failed to send message).         |
