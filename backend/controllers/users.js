const bcrypt = require('bcrypt');
const userRouter = require('express').Router();
const User = require('../models/users');
const jwt = require('jsonwebtoken');

userRouter.post('/', async (req, res) => {
    const body = req.body;

    //error handling??
    if (body.username.length < 3 || body.password.length < 3) {
        res.json({ error: 'Username and/or Password must have at least 3 characters' }).status(400).end();
        return;
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(body.password, saltRounds);

    const userObj = new User({
        username: body.username,
        name: body.name,
        passwordHash,
    })

    const savedUser = await userObj.save();

    //generate auth token for new user
    const jwtUserInfo = {
        username: savedUser.username,
        id: savedUser.id
    }

    const token = jwt.sign(jwtUserInfo, process.env.SECRET);

    res.json({ ...savedUser.toJSON(), token });
})

userRouter.get('/', async (req, res) => {
    let users = await User.find({}).populate('blogs');

    res.send(users);
})

module.exports = userRouter;