//  api/index.js is created solely for the purpose of 
// deploying the app to vercel. This will be the entry
//  point defined in vercel.json and this is where
//  I'm making it serverless app which vercel supports.

//const { createServer } = require('@vercel/node')
const app = require('../server') // import your Express app

module.exports = app
