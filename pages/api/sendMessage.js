// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

const venom = require("venom-bot");

export default async function handler(req, res) {
  venom.create(
    //session
    "chip-vivo", //Pass the name of the client you want to start the bot
    //catchQR
    (base64Qr, asciiQR, attempts, urlCode) => {
      // console.log(asciiQR); // Optional to log the QR in the terminal
      // console.log("Terminal qrcode: ", asciiQR);
      // console.log("base64 image string qrcode: ", base64Qrimg);
      // console.log("urlCode (data-ref): ", urlCode);

      var matches = base64Qr.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {};

      if (matches.length !== 3) {
        return new Error("Invalid input string");
      }
      response.type = matches[1];
      response.data = new Buffer.from(matches[2], "base64");

      var imageBuffer = response;
      require("fs").writeFile(
        "public/qrcode.png",
        imageBuffer["data"],
        "binary",
        function (err) {
          if (err != null) {
            console.log(err);
          }
        }
      );
    },
    // statusFind
    (statusSession, session) => {
      console.log("Status Session: ", statusSession); 
      //return isLogged || notLogged || browserClose || qrReadSuccess || qrReadFail || autocloseCalled || desconnectedMobile || deleteToken || chatsAvailable || 
      // deviceNotConnected || serverWssNotConnected || noOpenBrowser || initBrowser || openBrowser || connectBrowserWs || initWhatsapp || erroPageWhatsapp || 
      // successPageWhatsapp || waitForLogin || waitChat || successChat
      // Create session wss return "serverClose" case server for close
      console.log("Session name: ", session);

      if(statusSession == "qrReadFail" || statusSession == "erroPageWhatsapp" || statusSession == "desconnectedMobile") {
        res.status(422).json({ statusSession });
      } else if(statusSession == "connectBrowserWs") {
        res.status(200).json({ statusSession });
      }
    },
    // options
    {
      multidevice: false, // for version not multidevice use false.(default: true)
      folderNameToken: "tokens", //folder name when saving tokens
      mkdirFolderToken: "", //folder directory tokens, just inside the venom folder, example:  { mkdirFolderToken: '/node_modules', } //will save the tokens folder in the node_modules directory
      headless: true, // Headless chrome
      devtools: false, // Open devtools by default
      useChrome: true, // If false will use Chromium instance
      debug: false, // Opens a debug session
      logQR: true, // Logs QR automatically in terminal
      browserWS: "", // If u want to use browserWSEndpoint
      browserArgs: [""], // Original parameters  ---Parameters to be added into the chrome browser instance
      addBrowserArgs: [""], // Add broserArgs without overwriting the project's original
      puppeteerOptions: {}, // Will be passed to puppeteer.launch
      disableSpins: true, // Will disable Spinnies animation, useful for containers (docker) for a better log
      disableWelcome: true, // Will disable the welcoming message which appears in the beginning
      updatesLog: true, // Logs info updates automatically in terminal
      autoClose: 20000, // Automatically closes the venom-bot only when scanning the QR code (default 60 seconds, if you want to turn it off, assign 0 or false)
      createPathFileToken: false, // creates a folder when inserting an object in the client's browser, to work it is necessary to pass the parameters in the function create browserSessionToken
      chromiumVersion: "1002410", // Version of the browser that will be used. Revision strings can be obtained from omahaproxy.appspot.com.
      addProxy: [""], // Add proxy server exemple : [e1.p.webshare.io:01, e1.p.webshare.io:01]
      userProxy: "", // Proxy login username
      userPass: "", // Proxy password
    },
    // BrowserInstance
    (browser, waPage) => {
      console.log("Browser PID:", browser.process().pid);
      waPage.screenshot({ path: "screenshot.png" });
    }
  ).then((client) => {
    console.log("Client BOT: ", client);

    // start(client);
  })
  .catch((erro) => {
    console.log("ERROR CLIENT", erro);
    res.status(400).json({ statusSession: erro });
  });
}
