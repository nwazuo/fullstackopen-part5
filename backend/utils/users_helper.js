const User = require('../models/users');

const usersInDB = async () => {
    let users = await User.find({});
    return users.map(u => u.toJSON());
}

module.exports = {
    usersInDB
}