const express = require('express');
require('express-async-errors');
const mongoose = require('mongoose');
const app = express()
const cors = require('cors')
const config = require('./utils/config')
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const logger = require('./utils/logger');
const middleware = require('./utils/middleware');

const mongoUrl = config.MONGODB_URI;
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true }).then(() => {
    logger.info('Connected to database')
}).catch(err => logger.error('An error occured: ', err));

app.use(cors())
app.use(express.json())
app.use(middleware.tokenExtractor)
app.use(middleware.requestLogger)

app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)
app.use('/login', loginRouter)
app.use(middleware.unknownEndPoint)
app.use(middleware.errorRequestHandler)

module.exports = app