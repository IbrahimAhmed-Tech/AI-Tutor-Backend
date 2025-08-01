const express = require("express");
const cors = require('cors');
const path = require("path");
require("dotenv").config();
const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5000;
const authRouter = require('./src/routes/authRoutes')
const aiConversationRoutes = require('./src/routes/aiConversationRoutes');

app.get("/", (req, res) => {
    res.send("Backend working on Vercel.");
});


app.use('/api/auth', authRouter);
app.use('/api/ai-conversation', aiConversationRoutes);
app.use('/public', express.static(path.join(__dirname, 'src', 'public')));


module.exports = app;