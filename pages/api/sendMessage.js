const { Client, LocalAuth } = require("whatsapp-web.js");
import NextCors from "nextjs-cors";

export default async function sendMessageWhatsapp(req, res) {
  // Run the cors middleware
  // nextjs-cors uses the cors package, so we invite you to check the documentation https://github.com/expressjs/cors
  await NextCors(req, res, {
    // Options
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    origin: process.env.ORIGINS_CORS,
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });

  if (req.method === "POST") {
    try {
      if (!req.body.phone) {
        res.status(404).json({ status: false, message: "Not found phone" });
      } else if (!req.body.message) {
        res.status(404).json({ status: false, message: "Not found message" });
      }

      const client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: { headless: true, args: ["--no-sandbox"] },
      });
      const phone = req.body.phone;
      const message = req.body.message;

      client.on("qr", (qr) => {
        // Generate and scan this code with your phone
        console.log("QR RECEIVED", qr);

        res
          .status(400)
          .json({ status: false, message: "Whatsapp not connected" });
      });

      client.on("ready", () => {
        console.log("Client is ready!");

        const chatId = `${phone}@c.us`;
        client
          .sendMessage(chatId, message)
          .then((result) => {
            console.log("Succesfully send message!");

            setTimeout(function () {
              client.destroy(); // DESCTROY client
            }, 3000);

            res
              .status(200)
              .json({ status: true, message: "Succesfully send message" });
          })
          .catch((error) => {
            console.log("Error send message: ", error);
            res
              .status(400)
              .json({ status: false, message: "Error send message" });
          });
      });

      client.initialize();
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Something went wrong" });
    }
  } else {
    res.status(405).json({ msg: "Method not allowed" });
  }
}
