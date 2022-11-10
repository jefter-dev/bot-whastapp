const {
  Client,
  LocalAuth,
  RemoteAuth,
  MessageMedia,
} = require("whatsapp-web.js");
const { MongoStore } = require("wwebjs-mongo");
const mongoose = require("mongoose");
import NextCors from "nextjs-cors";

async function base64SendPdf(client, phone, file, fileName) {
  return new Promise(async function (resolve, reject) {
    const media = new MessageMedia("application/pdf", file, fileName);
    await client
      .sendMessage(phone, media, { caption: fileName })
      .then((res) => resolve("Succesfully sent."))
      .catch((error) => {
        console.log("ERROR SEND FILE: ", error);
        reject("Can not send message.", error);
      });
  });
}

export default async function sendFileWhatsapp(req, res) {
  // Run the cors middleware
  // nextjs-cors uses the cors package, so we invite you to check the documentation https://github.com/expressjs/cors
  await NextCors(req, res, {
    // Options
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    origin: process.env.ORIGINS_CORS,
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });

  if (req.method === "POST") {
    // console.log("req.body: ", req.body); // DEBUG
    try {
      if (!req.body.phone) {
        res.status(404).json({ status: false, message: "Not found phone" });
      } else if (!req.body.file) {
        res.status(404).json({ status: false, message: "Not found file" });
      } else if (!req.body.nameFile) {
        res.status(404).json({ status: false, message: "Not found name file" });
      } else if (!req.body.messageSystem) {
        res
          .status(404)
          .json({ status: false, message: "Not found message system" });
      }

      mongoose.connect(process.env.MONGODB_URI).then(() => {
        const store = new MongoStore({ mongoose: mongoose });

        const client = new Client({
          authStrategy: new RemoteAuth({
            store: store,
            backupSyncIntervalMs: 150000,
          }),
          puppeteer: { headless: false, args: ["--no-sandbox"] },
        });

        const phone = req.body.phone;
        const file = req.body.file;
        const nameFile = req.body.nameFile;
        const messageSystem = req.body.messageSystem;

        client.on("qr", (qr) => {
          // Generate and scan this code with your phone
          console.log("QR RECEIVED", qr);

          res
            .status(400)
            .json({ status: false, message: "Whatsapp not connected" });

          setTimeout(function () {
            client.destroy(); // DESCTROY client
          }, 3000);
        });

        client.on("ready", () => {
          console.log("Client is ready!");

          const chatId = `${phone}@c.us`;
          client
            .sendMessage(chatId, messageSystem)
            .then((result) => {
              console.log("Succesfully send message!");
            })
            .catch((error) => {
              console.log("Error send message: ", error);
            });

          base64SendPdf(client, chatId, file, nameFile)
            .then((result) => {
              console.log("RESULT SEND FILE: ", result);
              setTimeout(function () {
                client.destroy(); // DESCTROY client
              }, 3000);

              res
                .status(200)
                .json({ status: true, message: "Succesfully send file" });
            })
            .catch((error) => {
              console.log("Error send file: ", error);
              res
                .status(400)
                .json({ status: false, message: "Error send file" });
            });
        });

        client.initialize();
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Something went wrong" });
    }
  } else {
    res.status(405).json({ msg: "Method not allowed" });
  }
}
