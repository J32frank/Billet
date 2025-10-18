const jwt = require('jsonwebtoken');


const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRE = process.env.JWT_EXPIRE || '3d';

const generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, {expiresIn: JWT_EXPIRE});
};

const verifyToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
};

const decodeToken = (token) => {
    try {
        return jwt.decode(token);
    } catch (err) {
        return null;
    }
};

module.exports = {
    generateToken,
    verifyToken,
    decodeToken
};