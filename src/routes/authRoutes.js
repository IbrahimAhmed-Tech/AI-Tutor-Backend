const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
router.get("/validate-token", authMiddleware, (req, res) => {
    return res.status(200).json({ message: "Token is valid" });
});
router.post('/signup', registerUser);
router.post('/login', loginUser);




module.exports = router;