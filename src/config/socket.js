// config/socket.js
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Message from "../modules/message/models/message.js";
import user from "../modules/auth/models/user.js";
import GroupRepository from "../modules/group/repositories/groupRepository.js";
import groupMessage from "../modules/group/models/groupMessage.js";

const onlineUsers = new Map();

const groupRepo = new GroupRepository();

/**
 * Initializes the Socket.IO server with authentication and event handlers.
 *
 * @param {http.Server} server - The HTTP server instance to attach Socket.IO to.
 *
 * This function sets up a Socket.IO server with CORS configurations and
 * JWT-based authentication middleware. It handles the following events:
 * - `connection`: Logs user connections, maintains an online users map, and emits user status.
 * - `getChatHistory`: Fetches chat history between the connected user and a specified receiver.
 * - `sendMessage`: Saves and emits new messages to the receiver if online and notifies the sender.
 * - `markAsRead`: Marks a message as read and notifies the sender.
 * - `disconnect`: Logs user disconnections and updates the online users map.
 */

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  console.log(`Socket.IO initialized...`);
  io.use((socket, next) => {
    if (socket.handshake.query && socket.handshake.query.token) {
      jwt.verify(
        socket.handshake.query.token,
        process.env.JWT_SECRET,
        (err, decoded) => {
          if (err) return next(new Error("Authentication error"));
          socket.user = decoded;
          next();
        }
      );
    } else {
      next(new Error("Authentication error"));
    }
  });

  
  io.on("connection", async (socket) => {
    const loggedUser = await user.findById(socket.user.id);
    if (!loggedUser) return socket.disconnect();
    onlineUsers.set(socket.user.id, {
      socketId: socket.id,
      username: loggedUser.username,
    });

    const allUsers = await user.find({}, "id username");
    const userStatus = allUsers.map((user) => ({
      _id: user.id.toString(),
      username: user.username,
      online: onlineUsers.has(user.id),
    }));
    // for emiting user status
    io.emit("userStatus", userStatus);
    // for emiting group list
    socket.on("getGroups", async () => {
      const groups = await groupRepo.findAllGroups();
      socket.emit("groupList", groups);
    });
    // for creating group
    socket.on("createGroup", async ({ name }) => {
      const group = await groupRepo.createGroup({
        name,
        creatorId: socket.user.id,
      });
      socket.join(group._id.toString());
      io.emit("groupList", await groupRepo.findAllGroups());
    });
    // for joining group
    socket.on("joinGroup", async ({ groupId }) => {
      const group = await groupRepo.addMember(groupId, socket.user.id);
      if (group) {
        socket.join(groupId);
      }
    });

    // Fetch chat history between two users
    socket.on("getChatHistory", async ({ receiver }) => {
      const messages = await Message.find({
        $or: [
          { sender: socket.user.id, receiver },
          { sender: receiver, receiver: socket.user.id },
        ],
      }).sort({ createdAt: 1 });
      socket.emit("chatHistory", messages);
    });
    // Fetch group chat history
    socket.on("getGroupChatHistory", async ({ groupId }) => {
      const messages = await groupMessage.find({ group: groupId }).sort({
        createdAt: 1,
      });
      socket.emit("groupChatHistory", messages);
    });
    // Send message
    socket.on("typing", ({ receiverId }) => {
      if (onlineUsers.has(receiverId)) {
        io.to(onlineUsers.get(receiverId).socketId).emit("userTyping", {
          sender: socket.user.id,
          username: loggedUser.username,
        });
      } else {
        io.to(receiverId).emit("userTyping", {
          sender: socket.user.id,
          username: loggedUser.username,
        });
      }
    });
    // Stop typing
    socket.on("stopTyping", ({ receiverId }) => {
      if (onlineUsers.has(receiverId)) {
        io.to(onlineUsers.get(receiverId).socketId).emit("userStoppedTyping", {
          sender: socket.user.id,
        });
      } else {
        io.to(receiverId).emit("userStoppedTyping", {
          sender: socket.user.id,
        });
      }
    });
    // Send message
    socket.on("sendUserMessage", async ({ receiver, message }) => {
      if (!receiver || !message) {
        return socket.emit("error", {
          message: "Receiver and message are required",
        });
      }
      try {
        const newMessage = new Message({
          sender: socket.user.id,
          receiver,
          message,
          read: false,
        });
        await newMessage.save();

        const messageData = {
          _id: newMessage._id,
          sender: newMessage.sender,
          receiver: newMessage.receiver,
          message: newMessage.message,
          read: newMessage.read,
          createdAt: newMessage.createdAt,
        };

        io.to(socket.id).emit("messageSent", messageData);
        if (onlineUsers.has(receiver)) {
          io.to(onlineUsers.get(receiver).socketId).emit(
            "receiveMessage",
            messageData
          );
        }
      } catch (error) {
        socket.emit("error", {
          message: "Failed to send user message",
          error: error.message,
        });
      }
    });
    // Send group message
    socket.on("sendGroupMessage", async ({ groupId, message }) => {
      if (!groupId || !message) {
        return socket.emit("error", {
          message: "Group ID and message are required",
        });
      }
      try {
        const senderUser = await user.findById(socket.user.id); // Fetch sender's user data
        if (!senderUser) throw new Error("Sender not found");
        const newMessage = new groupMessage({
          sender: socket.user.id,
          group: groupId,
          message,
          readBy: [socket.user.id], // Sender has read it
        });
        await newMessage.save();

        const messageData = {
          _id: newMessage._id,
          sender: newMessage.sender,
          senderUsername: senderUser.username,
          group: newMessage.group,
          message: newMessage.message,
          readBy: newMessage.readBy,
          createdAt: newMessage.createdAt,
        };
        // Send message to all users in the group
        socket.to(groupId).emit("receiveGroupMessage", messageData);
        io.to(socket.id).emit("messageSent", messageData);
      } catch (error) {
        socket.emit("error", {
          message: "Failed to send group message",
          error: error.message,
        });
      }
    });
    // Mark message as read
    socket.on("markAsRead", async ({ messageId, isGroup }) => {
      try {
        if (isGroup) {
          const message = await groupMessage.findByIdAndUpdate(
            messageId,
            { $addToSet: { readBy: socket.user.id } },
            { new: true }
          );
          if (message) {
            io.to(message.group.toString()).emit("messageRead", {
              messageId,
              readBy: message.readBy,
            });
          }
        } else {
          const message = await Message.findByIdAndUpdate(
            messageId,
            { read: true },
            { new: true }
          );
          if (message && onlineUsers.has(message.sender.toString())) {
            io.to(onlineUsers.get(message.sender.toString()).socketId).emit(
              "messageRead",
              {
                messageId,
                read: true,
              }
            );
          }
        }
      } catch (error) {
        throw new Error("Error marking message as read:", error);
      }
    });
    // Disconnect
    socket.on("disconnect", async () => {
      onlineUsers.delete(socket.user.id);
      const updatedUsers = await user.find({}, "id username");
      const updatedStatus = updatedUsers.map((user) => ({
        _id: user.id.toString(),
        username: user.username,
        online: onlineUsers.has(user.id),
      }));
      io.emit("userStatus", updatedStatus);
    });
  });
};
