const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});


io.on("connection", (socket) => {

  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
    socket.join(data.room);
    console.log(`User with ID: ${socket.id} and username: ${data.username} joined room: ${data.room}`);
    socket.data.username = data.username;
    socket.data.room = data.room;
    const messageData = {
      room: data.room,
      author: 'Bot',
      message: `${data.username} has joined the room.`,
      time:
        new Date(Date.now()).getHours() +
        ":" +
        new Date(Date.now()).getMinutes(),
    };
    handleOnline(socket.id, true, socket) //user id, online
    socket.to(data.room).emit("receive_message", messageData);
  });

  socket.on("send_message", (data) => {
    let sendData = {...data, 'userId':socket.id}
    socket.to(data.room).emit("receive_message", sendData);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
    const messageData = {
      room: socket.data.room,
      author: 'Bot',
      message: `${socket.data.username} has disconnected from the room.`,
      time:
        new Date(Date.now()).getHours() +
        ":" +
        new Date(Date.now()).getMinutes(),
    };
    handleOnline(socket.id, false, socket)
    socket.to(socket.data.room).emit("receive_message", messageData);

  });

  socket.on('canvas-data', (data) => {
    socket.broadcast.emit('canvas-data', data);

  });
});

server.listen(3001, () => {
  console.log("SERVER RUNNING");
});

const handleOnline = async(Id, online, socket) => {
  let onlineData = {userId:Id, isOnline : online}
  await socket.to(socket.data.room).emit("active", onlineData);
}
