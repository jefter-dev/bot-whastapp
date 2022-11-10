/** @type {import('next').NextConfig} */
const ORIGINS_CORS = ['https://bot-whastapp.vercel.app', "https://wdcsistema.com.br", "http://localhost", "http://localhost:3000", "http://localhost:3001"];
const MONGODB_URI = "mongodb+srv://botadmin:desenv123@cluster-bot-whatsapp.1lv23xu.mongodb.net/?retryWrites=true&w=majority";


const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  env: {
    ORIGINS_CORS,
    MONGODB_URI
  },
  api: {
    externalResolver: true,
    bodyParser: false,
    responseLimit: false,
  }
}

module.exports = nextConfig
