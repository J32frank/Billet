const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12;

const hashPassword = async (plainPassword) => {
    return await bcrypt.hash(plainPassword, SALT_ROUNDS);
};

const comparePassword = async (plainPassword, hashPassword) => {
    return await bcrypt.compare(plainPassword, hashPassword);
};

module.exports = {
    hashPassword,
    comparePassword,
};