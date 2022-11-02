// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import NextCors from 'nextjs-cors';

export default async function getTestConnection(req, res) {
    // Run the cors middleware
    // nextjs-cors uses the cors package, so we invite you to check the documentation https://github.com/expressjs/cors
    await NextCors(req, res, {
        // Options
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        origin: process.env.ORIGINS_CORS,
        optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    });

    if (req.method === 'GET') {
        try {
            const data = {test: "test"}
            return res.status(200).json( data )
        } catch (err) {
            console.error(err)
            return res.status(500).json({ msg: 'Something went wrong' })
        }
    } else {
        return res.status(405).json({ msg: 'Method not allowed' })
    } 
}