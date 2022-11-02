// socket.js
import { Server } from "socket.io";
import fs, { writeFile } from "fs";
import NextCors from "nextjs-cors";
const venom = require("venom-bot");

const getRandomNumber = () => {
  const min = Math.ceil(1);
  const max = Math.floor(9999999999);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

async function sendMessage(client, message, phoneNumber) {
  // Send basic text
  client
    .sendText(`${phoneNumber}@c.us`, message)
    .then((result) => {
      console.log("Result: ", result); //return object success
    })
    .catch((erro) => {
      console.error("Error when sending: ", erro); //return object error
    });

  return false;
}

async function sendFile(client, nameFile, phoneNumber) {
  // Send file
  try {
    const resultSendFile = await client.sendFile(
      `${phoneNumber}@c.us`,
      "public/relatorio.pdf",
      nameFile,
      "File uploaded successfully"
    );

    console.log("resultSendFile: ", resultSendFile);

    return { status: true, message: resultSendFile.text };
  } catch (error) {
    console.error("Error when sending: ", error); //return object error
    return { status: false, message: error.text };
  }
}

async function sendFileFromBase64(client, fileBase64, nameFile, phoneNumber) {
  // Send file base 64
  try {
    const resultSendFileFromBase64 = await client.sendFileFromBase64(
      `${phoneNumber}@c.us`,
      fileBase64,
      nameFile,
      "File uploaded successfully"
    );

    console.log("resultSendFileFromBase64: ", resultSendFileFromBase64);

    return { status: true, message: resultSendFileFromBase64.text };
  } catch (error) {
    console.error("Error when sending: ", error); //return object error
    return { status: false, message: error.text };
  }
}

const deleteFolderRecursive = function (path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function (file) {
      var curPath = path + "/" + file;

      // console.log("curPath: ", curPath); // DEBUG
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        deleteFolderRecursive(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

const SocketHandler = async (req, res) => {
  console.log("PERMISSIONS CORS: ", process.env.ORIGINS_CORS);

  // Run the cors middleware
  // nextjs-cors uses the cors package, so we invite you to check the documentation https://github.com/expressjs/cors
  await NextCors(req, res, {
    // Options
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    origin: process.env.ORIGINS_CORS,
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });

  if (!req.query.user) {
    return res.status(404).json({ status: false, message: "Not found user" });
  }

  // console.log("res.socket.server.io: ", res.socket.server.io);

  if (res.socket.server.io) {
    console.log("Socket is already running");
  } else {
    console.log("Socket is initializing");
    const io = new Server(res.socket.server);

    io.on("connection", (socket) => {
      venom
        .create(
          //session
          "connection", // Pass the name of the client you want to start the bot
          //catchQR
          (base64Qr, asciiQR, attempts, urlCode) => {
            socket.emit("imgQrCode", base64Qr);
          },
          // statusFind
          (statusSession, session) => {
            console.log("Status Session: ", statusSession);
            console.log("Session name: ", session);

            socket.emit("statusSession", statusSession);
          },
          // options
          // { headless: false },
          { },
          // BrowserInstance
          (browser, waPage) => {
            console.log("Browser PID:", browser.process().pid);
            waPage.screenshot({ path: "screenshot.png" });
          }
        )
        .then((client) => {
          console.log("Client BOT: ", client);

          socket.on("sendMessage", (data) => {
            console.log("MESSAGE: ", data.message);
            console.log("PHONE NUMBER: ", data.phoneNumber);

            sendMessage(client, data.message, data.phoneNumber);
          });

          socket.on("sendFile", (data, callback) => {
            // console.log("FILE: ", data.file); // DEBUG

            const sendFileFromBase64Result = async () => {
              // console.log("FILE BASE 64 SERVER: ", data.file); // DEBUG

              // Send standard company message
              try {
                const result = await sendMessage(
                  client,
                  data.message,
                  data.phoneNumber
                );
                console.log("RESULT MESSAGE: ", result);
              } catch (error) {
                console.log("ERROR SEND MESSAGE EXTERNAL: ", error);
              }

              // Send file XML
              try {
                const result = await sendFileFromBase64(
                  client,
                  data.file,
                  data.nameFile,
                  data.phoneNumber
                );

                console.log("RESULT SEND FILE: ", result);
                callback({ message: result.message });
              } catch (error) {
                console.log("ERROR SEND FILE EXTERNAL: ", error);
                callback({ message: "ERROR SEND FILE EXTERNAL" });
              }
            };

            sendFileFromBase64Result();
          });
        })
        .catch((erro) => {
          console.log("ERROR CLIENT", erro);
          res.status(400).json({ statusSession: erro });
        });
    });

    res.socket.server.io = io;
  }
  res.end();
};

export default SocketHandler;
