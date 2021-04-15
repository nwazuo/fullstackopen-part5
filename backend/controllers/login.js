const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/users');
const loginRouter = require('express').Router();

loginRouter.post('/', async (request, response) => {
  console.log('Hey I got here 1');
  const body = request.body;

  const user = await User.findOne({ username: body.username });

  const passwordFound =
    user === null
      ? false
      : await bcrypt.compare(body.password, user.passwordHash);

  if (!(user && passwordFound)) {
    return response.status(401).json({ error: 'Invalid user credentials' });
  }

  const userCredentials = {
    username: user.username,
    id: user._id,
  };

  const token = jwt.sign(userCredentials, process.env.SECRET);

  console.log('hey I got here 2');
  return response.json({
    username: user.username,
    name: user.name,
    token,
  });
});

module.exports = loginRouter;
