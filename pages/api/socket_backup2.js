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
  await client
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

const viewFilesInFolder = function (path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function (file) {
      var curPath = path + "/" + file;
      console.log("curPath: ", curPath); // DEBUG
    });
  }
};

const createFolder = (pathImgQrcode) => {
  // Check if the path exists
  if (!fs.existsSync(pathImgQrcode)) {
    // Create the directory
    fs.mkdir(pathImgQrcode, (err) => {
      if (err) {
        console.log("Error creating directory! =(: ", err);
        return false;
      }

      console.log("Directory created! =)");
    });
  }
};

const saveImageQrCodeCurrent = (base64Qr, imgQrcode) => {
  var matches = base64Qr.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
    response = {};

  if (matches.length !== 3) {
    return new Error("Invalid input string");
  }
  response.type = matches[1];
  response.data = new Buffer.from(matches[2], "base64");

  var imageBuffer = response;
  fs.writeFile(imgQrcode, imageBuffer["data"], "binary", function (err) {
    if (err != null) {
      console.log("Erro saved image! =(", err);
    }
    
    console.log("Saved image successefully! =)", err);
  });

  return false;
};

const SocketHandler = async (req, res) => {
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

  console.log("res.socket.server.io: ", res.socket.server.io);

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
            // console.log(asciiQR); // Optional to log the QR in the terminal
            // console.log("Terminal qrcode: ", asciiQR);
            // console.log("base64 image string qrcode: ", base64Qrimg);
            // console.log("urlCode (data-ref): ", urlCode);
            // const nameImage = `qrcode_${getRandomNumber()}.png`;
            // const pathImgQrcode = `public/qrcode/${req.query.user}`;
            // const imgQrcode = `public/qrcode/${req.query.user}/${nameImage}`;

            // Delete user directory
            // deleteFolderRecursive(pathImgQrcode);
            // viewFilesInFolder(pathImgQrcode);
            // createFolder(pathImgQrcode);
            // saveImageQrCodeCurrent(base64Qr, imgQrcode);

            socket.emit("imgQrCode", base64Qr);
            // if (imgQrcode) {
            // }
          },
          // statusFind
          (statusSession, session) => {
            console.log("Status Session: ", statusSession);
            console.log("Session name: ", session);

            socket.emit("statusSession", statusSession);
          },
          // options
          {},
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
            console.log("FILE: ", data.file);
            // console.log("PHONE NUMBER: ", data.phoneNumber);

            // sendFile(client, data.file, data.phoneNumber);
            // console.log(file); // <Buffer 25 50 44 ...>

            // save the content to the disk, for example
            writeFile("public/relatorio.pdf", data.file, (err) => {
              console.log("STATUS UPLOAD ARQUIVO: ", err);

              if (!err) {
                const sendFileResult = async () => {
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
                    const result = await sendFile(
                      client,
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

                sendFileResult();
              }
            });
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
