const app = require('../server'); // assuming app is defined elsewhere
const serverless = require('serverless-http');

module.exports = serverless(app);
