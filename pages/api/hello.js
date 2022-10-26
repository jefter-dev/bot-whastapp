// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { venom } from "../../backend/controller/botwhatsappController"

export default function handler(req, res) {
  console.log("VENOM: ", venom);

  res.status(200).json({ name: 'Send message' })
}
