/** @type {import('next').NextConfig} */
const ORIGINS_CORS = ['https://bot-whastapp.vercel.app', "http://localhost", "http://localhost:3000", "http://localhost:3001"];

const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  env: {
    ORIGINS_CORS,
  },
  api: {
    externalResolver: true,
    bodyParser: false,
    responseLimit: false,
  },
}

module.exports = nextConfig
