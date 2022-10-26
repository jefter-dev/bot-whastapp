// socket.js
import { Server } from "socket.io";

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log("Socket is already running");
  } else {
    console.log("Socket is initializing");
    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    let countServer = 0;

    io.on("connection", (socket) => {
      socket.on("input-change", (msg) => {
        socket.broadcast.emit("update-input", msg);
      });

      socket.on("count-server", () => {
        setInterval(() => {
          countServer += 1;
          socket.broadcast.emit("count-server", countServer);
        }, 1000);
      });
    });
  }
  res.end();
};

export default SocketHandler;
