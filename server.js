const express = require("express");
const cors = require('cors'); 
require("dotenv").config();
const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5000;
const supabase = require('./supabaseClient');
const authRouter = require('./src/routes/authRoutes')
const transcribeRoutes = require('./src/routes/transcribeRoutes');

app.get("/", (req, res) => {
    res.send("API is working");
});


app.use('/api/auth', authRouter);
app.use('/api/transcribe', transcribeRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
