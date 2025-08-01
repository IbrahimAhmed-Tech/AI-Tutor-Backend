const authService = require('../services/authService');

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    const { error, userId } = await authService.signUpUser({ name, email, password });
    console.log("error", error)
    if (error) return res.status(400).json({ error });

    res.status(200).json({ message: 'User registered and profile created successfully', userId });
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
   console.log("passowrd", password)
    const { error, token, user } = await authService.signInUser({ email, password });

    if (error) return res.status(400).json({ error });

    res.status(200).json({
        message: 'User logged in successfully',
        token,
        user,
    });
};

module.exports = { registerUser, loginUser };



