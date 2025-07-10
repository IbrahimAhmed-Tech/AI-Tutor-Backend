const express = require("express");
const multer = require("multer");
const path = require("path");
const { handleAiConversation } = require("../controllers/aiConversationController");

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".webm";
    cb(null, `${Date.now()}-${file.originalname}${ext}`);
  },
});

const upload = multer({ storage });

router.post("/", upload.single("audio"), handleAiConversation);

module.exports = router;
