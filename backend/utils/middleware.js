const logger = require('./logger');

const requestLogger = (request, response, next) => {
    logger.info('Method: ', request.method);
    logger.info('Path: ', request.path);
    logger.info('Body: ', request.body);
    logger.info('---');

    next();
}


const unknownEndPoint = (error, request, response, next) => {
    response.status(404).send({ error: 'unknown endpoint' });
}

const errorRequestHandler = (error, request, response, next) => {
    if (error.name === 'CastError') {
        return response.status(400).json({ error: 'malformatted id' });
    }
    else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }
    else if (error.name === 'JsonWebTokenError') {
        return response.status(400).json({ error: 'invalid token' })
    }

    logger.info('Something went wrong!:', error);
    next(error);
}


const tokenExtractor = (request, response, next) => {
    let authorization = request.get('authorization');
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        request.token = authorization.substring(7);
    } else {
        request.token = null;
    }

    next();
}

module.exports = {
    requestLogger,
    unknownEndPoint,
    errorRequestHandler,
    tokenExtractor
}
