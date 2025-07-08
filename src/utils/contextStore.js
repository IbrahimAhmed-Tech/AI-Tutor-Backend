const userContextMap = new Map();

const setUserContext = (userId, context) => {
    userContextMap.set(userId, context);
};

const getUserContext = (userId) => {
    return userContextMap.get(userId);
};
module.exports = {
    setUserContext,
    getUserContext,
};
