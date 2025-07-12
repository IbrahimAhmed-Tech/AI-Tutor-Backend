const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { handleAiConversation } = require("../controllers/aiConversationController");

const router = express.Router();
return res.status(200).json({ message: "Request reached the route successfully." });

console.log("Starting AI conversation handler");

setTimeout(() => {
  console.log("Still running after 10 seconds...");
}, 10000);
// Define writable upload path for serverless environments
const uploadPath = "/tmp/uploads";

// Ensure the /tmp/uploads directory exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".webm";
    cb(null, `${Date.now()}-${file.originalname}${ext}`);
  },
});

const upload = multer({ storage });

router.post("/", upload.single("audio"), handleAiConversation);

module.exports = router;
