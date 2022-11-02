// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import NextCors from "nextjs-cors";
const venom = require("venom-bot");

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
      venom
        .create(
          //session
          "connection", // Pass the name of the client you want to start the bot
          //catchQR
          (base64Qr, asciiQR, attempts, urlCode) => {
            console.log("You need to do login");
            res
              .status(400)
              .json({ status: false, messagem: "You need to do login" });
          },
          // statusFind
          (statusSession, session) => {
            console.log("Status Session: ", statusSession);
            console.log("Session name: ", session);
          },
          // options
          // {},
          { headless: false },
          // BrowserInstance
          (browser, waPage) => {
            console.log("Browser PID:", browser.process().pid);
            waPage.screenshot({ path: "screenshot.png" });
          }
        )
        .then((client) => {
          console.log("Client connected");

          const message = "New message";
          const phoneNumber = "5511981816780";
          try {
            sendMessage(client, message, phoneNumber);
          } catch (error) {
            console.log("ERROR SEND MESSAGE: ", error);            
          }

          res.status(200).json({ status: true, message: "Success connect" });
          
          // const sendFileFromBase64Result = async () => {
          //   // console.log("FILE BASE 64 SERVER: ", data.file); // DEBUG

          //   // Send standard company message
          //   try {
          //     const result = await sendMessage(
          //       client,
          //       data.message,
          //       data.phoneNumber
          //     );
          //     console.log("RESULT MESSAGE: ", result);
          //   } catch (error) {
          //     console.log("ERROR SEND MESSAGE EXTERNAL: ", error);
          //   }

          //   // Send file XML
          //   try {
          //     const result = await sendFileFromBase64(
          //       client,
          //       data.file,
          //       data.nameFile,
          //       data.phoneNumber
          //     );

          //     console.log("RESULT SEND FILE: ", result);
          //     callback({ message: result.message });
          //   } catch (error) {
          //     console.log("ERROR SEND FILE EXTERNAL: ", error);
          //     callback({ message: "ERROR SEND FILE EXTERNAL" });
          //   }
          // };

          // sendFileFromBase64Result();
        })
        .catch((erro) => {
          console.log("ERROR CLIENT", erro);
          res.status(400).json({ statusSession: erro });
        });

      // return res.status(200).json({status: true});
    } catch (err) {
      console.error(err);
      return res.status(500).json({ msg: "Something went wrong" });
    }
  } else {
    return res.status(405).json({ msg: "Method not allowed" });
  }
}
