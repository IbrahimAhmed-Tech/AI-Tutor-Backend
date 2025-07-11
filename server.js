const express = require("express");
const cors = require('cors');
const path = require("path"); 
const serverless = require("serverless-http"); 

require("dotenv").config();
const app = express();
app.use(cors());
app.use(express.json());
const supabase = require('./supabaseClient');
const authRouter = require('./src/routes/authRoutes')
const aiConversationRoutes = require('./src/routes/aiConversationRoutes');

app.get("/", (req, res) => {
    res.send("API is working");
});


app.use('/api/auth', authRouter);
app.use('/api/ai-conversation', aiConversationRoutes);
app.use('/public', express.static(path.join(__dirname, 'src', 'public')));

module.exports = app;
module.exports.handler = serverless(app);
