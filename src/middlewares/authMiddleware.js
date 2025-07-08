const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY // DO NOT expose this in frontend!
);

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }

        req.user = user; // attach user info to request
        next();
    } catch (err) {
        return res.status(500).json({ message: 'Token validation failed', error: err.message });
    }
};

module.exports = authMiddleware;
