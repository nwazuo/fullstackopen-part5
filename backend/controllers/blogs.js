const blogsRouter = require('express').Router();
const Blog = require('../models/blogs');
const User = require('../models/users');
const jwt = require('jsonwebtoken');

blogsRouter.get('/', async (request, response) => {
    let blogs = await Blog.find({}).populate('user', { username: 1, name: 1 });
    response.json(blogs);
})

blogsRouter.get('/:id', async (request, response) => {
    let blog = await Blog.findById(request.params.id)
        .populate('user', { username: 1, name: 1 });

    if (!blog) {
        return response.status(404).json({ error: 'Blog not found!' })
    }

    response.json(blog);
})

const verifyUserToken = async (request, response, next) => {
    let token = request.token;

    if (!token) {
        console.log('got in here ----->');
        return response.status(401).json({ error: 'unauthorized' })
    }

    let userCredentials = jwt.verify(token, process.env.SECRET);

    let user = await User.findOne({ username: userCredentials.username });

    if (!user) {
        return response.json({ error: 'Unauthorized!, user not found' }).status(401);
    }
    request.userInfo = {
        user, userCredentials
    };

    next();
}

blogsRouter.post('/', verifyUserToken, async (request, response) => {

    let { user, userCredentials } = request.userInfo;

    if (!request.body.title || !request.body.url) {
        response.status(400).json({ error: 'Blog title or URL missing from request' });
        return;
    }

    const newBlog = {
        _id: request.body._id,
        title: request.body.title,
        url: request.body.url,
        author: user.username,
        user: userCredentials.id
    }

    const blog = new Blog(newBlog);
    let savedBlog = await blog.save();

    user.blogs = user.blogs.concat(savedBlog);
    await user.save();

    response.status(201).json(savedBlog);
})

blogsRouter.delete('/:id', verifyUserToken, async (request, response) => {
    let blog = await Blog.findById(request.params.id);
    let { user, userCredentials } = request.userInfo;


    if (!blog) {
        return response.status(404).json({ error: 'Resource not found' });
    }

    if (blog.user.toString() !== userCredentials.id.toString()) {
        return response.status(401).json({ error: 'Unauthorized; only a blog author can delete their blog' });
    }

    await Blog.findByIdAndDelete(request.params.id);
    return response.status(204).end();
})

blogsRouter.put('/:id', verifyUserToken, async (request, response) => {
    let blog = await Blog.findById(request.params.id);
    let { user, userCredentials } = request.userInfo;


    if (!blog) {
        return response.status(404).json({ error: 'Resource not found' });
    }

    if (blog.user.toString() !== userCredentials.id.toString()) {
        return response.status(401).json({ error: 'Unauthorized; only a blog author can edit their blog' });
    }

    let updated = await Blog.findByIdAndUpdate(request.params.id, request.body, { new: true });

    response.status(400).json(updated);
})

module.exports = blogsRouter;