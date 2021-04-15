const Blog = require('../models/blogs');

const blogsInDB = async () => {
    let blogs = await Blog.find({});
    return blogs.map(b => b.toJSON());
}

module.exports = {
    blogsInDB
}