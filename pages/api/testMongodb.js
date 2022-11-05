const { MongoClient, ServerApiVersion } = require("mongodb");

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

  const uri =
    "mongodb+srv://botadmin:desenv123@cluster-bot-whatsapp.1lv23xu.mongodb.net/?retryWrites=true&w=majority";
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
  });

  //   console.log("CLIENTE MONGO: ", client); // DEBUG

  client.connect((error) => {
    console.log("error: ", error);

    if (error) {
      return res.status(404).json();
    }

    const collection = client.db("test").collection("devices");

    // console.log("collection : ", collection);

    // perform actions on the collection object
    client.close();
  });

  return res.status(200).json();
}
