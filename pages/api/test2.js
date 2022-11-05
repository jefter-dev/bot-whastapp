const { Client, RemoteAuth } = require("whatsapp-web.js");
const { MongoStore } = require("wwebjs-mongo");
const mongoose = require("mongoose");
import NextCors from "nextjs-cors";

export default async function getTestConnection(req, res) {
  // Run the cors middleware
  // nextjs-cors uses the cors package, so we invite you to check the documentation https://github.com/expressjs/cors
  await NextCors(req, res, {
    // Options
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    origin: process.env.ORIGINS_CORS,
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });

  mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const store = new MongoStore({ mongoose: mongoose });
    // console.log("store: ", store); // DEBUG

    const result = await store.delete({session: 'RemoteAuth'}); // Deleta a sessão para salvar uma nova
    console.log("RESULT DELETE: ", result);

    const client = new Client({
      authStrategy: new RemoteAuth({
        store: store,
        backupSyncIntervalMs: 150000,
      }),
      puppeteer: { headless: false, args: ["--no-sandbox"] },
    });

    client.on("qr", (qr) => {
      // Generate and scan this code with your phone
      console.log("QR RECEIVED", qr);

      //   res
      //     .status(400)
      //     .json({ status: false, message: "Whatsapp not connected" });
    });

    client.on("ready", () => {
      console.log("Client is ready!");

      setTimeout(function () {
        client.destroy(); // DESCTROY client
      }, 3000);

      res.status(200).json({ status: true, message: "Connected" });

    });
    
    client.on("remote_session_saved", () => {
      console.log("SESSION SAVED IN THE DATABASE");

      res.status(200).json({ status: true, message: "SAVE SESSION IN THE MONGODB" });
    });

    client.initialize();
  });
}
