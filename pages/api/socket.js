import { Server } from "socket.io";
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
import NextCors from "nextjs-cors";
async function base64SendPdf(client, phone, file, fileName) {
  return new Promise(async function (resolve, reject) {
    const media = new MessageMedia("application/pdf", file, fileName);
    await client
      .sendMessage(phone, media)
      .then((res) => resolve("Succesfully sent."))
      .catch((error) => {
        console.log("ERROR SEND FILE: ", error);
        reject("Can not send message.", error);
      });
  });
}

export default async function sendMessageWhatsapp(req, res) {
  // Run the cors middleware
  // nextjs-cors uses the cors package, so we invite you to check the documentation https://github.com/expressjs/cors
  await NextCors(req, res, {
    // Options
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    origin: process.env.ORIGINS_CORS,
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });

  if (res.socket.server.io) {
    console.log("Socket is already running");
  } else {
    console.log("Socket is initializing");
    const io = new Server(res.socket.server);

    io.on("connection", (socket) => {
      console.log("CONNECT SOCKET [connection]");
      socket.emit("status", "CONNECT SOCKET");

      // await store.delete({ session: "RemoteAuth" }); // Delete session in mongodb, for will save a new session

      const client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: { headless: true, args: ["--no-sandbox"] },
      });

      client.on("qr", (qr) => {
        // Generate and scan this code with your phone
        console.log("QR RECEIVED [SOCKET]: ", qr);
        socket.emit("status", "QR RECEIVED");

        socket.emit("qr", qr);
      });

      client.on("ready", () => {
        console.log("Client is ready!");

        socket.emit("status", "Client is ready!");

        setTimeout(function () {
          client.destroy(); // DESTROY client

          socket.emit("status", "Saved session!");
        }, 3000);
      });

      socket.on("message", (data) => {
        console.log("MESSAGE: ", data.message);
        console.log("PHONE: ", data.phone);

        const chatId = `${data.phone}@c.us`;
        client.sendMessage(chatId, data.message);
      });

      socket.on("file", (data) => {
        console.log("PHONE: ", data.phone);

        const chatId = `${data.phone}@c.us`;
        base64SendPdf(client, chatId, data.file, data.nameFile).then((result) =>
          console.log("RESULT SEND FILE: ", result)
        );
      });

      client.initialize();
    });

    res.socket.server.io = io;
  }

  res.end();
}
