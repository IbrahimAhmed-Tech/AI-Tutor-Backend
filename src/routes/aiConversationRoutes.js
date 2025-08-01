const express = require("express");
const multer = require("multer");
const path = require("path");
const { handleAiConversation } = require("../controllers/aiConversationController");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("audio"), handleAiConversation);

module.exports = router;