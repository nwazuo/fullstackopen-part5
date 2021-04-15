const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);

const Blog = require('../models/blogs');
const helper = require('../utils/blogs_helper');

const initialBlogs = [{ _id: "5a422a851b54a676234d17f7", title: "React patterns", author: "Michael Chan", url: "https://reactpatterns.com/", likes: 7, __v: 0 }, { _id: "5a422aa71b54a676234d17f8", title: "Go To Statement Considered Harmful", author: "Edsger W. Dijkstra", url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html", likes: 5, __v: 0 }
]

const authReq = (method = 'post', URL, TOKEN) => api[method](URL).set('Authorization', `Bearer ${TOKEN}`);

// might not be needing this
/*
const request = {
    post: authReq('post'),
    get: authReq('get'),
    put: authReq('put'),
    delete: authReq('delete'),
};

*/

// initialize test database with  initial test data
beforeEach(async () => {
    await Blog.deleteMany({});
    for (blog of initialBlogs) {
        let blogObject = new Blog(blog);
        await blogObject.save()
    }
})

test('returns blog posts', async () => {
    await api.get('/api/blogs').expect(200).expect('Content-Type', /application\/json/)
})

test('id property is present in returned object', async () => {
    let returnObj = await api.get('/api/blogs');
    expect(returnObj.body[0].id).toBeDefined();
})


test('adding a blog fails with status 401 if token is not provided', async () => {
    let newBlog = {
        title: 'The fall of man',
        url: 'Genesis.com'
    }

    await api.post('/api/blogs').send(newBlog).expect(401);
})


describe('when user is authenticated', () => {
    let loginToken;

    // generate login token for tests that require it
    beforeAll(async () => {
        let userCred = {
            username: 'chizonwazuo',
            password: 'themanofwar'
        }


        loginToken = (await api.post('/api/users').send(userCred)).body.token;
    })

    test('blog entries can be created', async () => {
        const newBlog = { title: "Type wars", author: "Robert C. Martin", url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html", likes: 2, __v: 0 };

        await authReq('post', '/api/blogs', loginToken).send(newBlog).expect(201).expect('Content-Type', /application\/json/)

        let response = await api.get('/api/blogs');

        let content = response.body.map(r => r.title)

        expect(content).toHaveLength(initialBlogs.length + 1);

        expect(content).toContain('Type wars');
    })

    test('missing likes field defaults to 0', async () => {
        const sampleBlog = { title: "On Reading Documentation", url: "http://chizo.me", __v: 0 }

        let blog = await authReq('post', '/api/blogs', loginToken).send(sampleBlog).expect(201).expect('Content-Type', /application\/json/)

        let response = await api.get(`/api/blogs/${blog.body.id}`);
        let content = response.body;

        expect(content.title).toContain('Reading Documentation');

        expect(content.likes).toBe(0);

    })

    test('missing title or url field returns bad request', async () => {
        const sampleBlog = { _id: "303030303030303030303030", author: "Marijn Haverbeke" }

        await authReq('post', '/api/blogs', loginToken).send(sampleBlog).expect(400);
    })

    test('delete request deletes resource', async () => {
        const blogsAtStart = await helper.blogsInDB();

        const sampleBlog = {
            title: "The greatest coder ever liveth",
            url: "chizo.me/codoo"
        }

        const toBeDeletedId = (await authReq('post', '/api/blogs', loginToken).send(sampleBlog)).body.id;

        console.log('==> to be deleted', toBeDeletedId);

        await authReq('delete', `/api/blogs/${toBeDeletedId}`, loginToken).expect(204);

        let getAllNotes = await api.get('/api/blogs');
        expect(getAllNotes.body).toHaveLength(blogsAtStart.length);
    })

    test('blog entry can be updated with new values', async () => {

        const sampleBlog = {
            title: "The greatest coder ever liveth",
            url: "chizo.me/codoo"
        }

        const testDocumentId = (await authReq('post', '/api/blogs', loginToken).send(sampleBlog)).body.id;

        const update = {
            title: "Something to be updated",
            url: "chizo.me/hanoi"
        }

        let result = await authReq('put', `/api/blogs/${testDocumentId}`, loginToken).send(update);

        expect(result.body.title).toContain('Something to be updated');

    })

    test('newly created blog has user details', async () => {
        const newBlog = { title: "Type wars", author: "Robert C. Martin", url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html", likes: 2, __v: 0 };

        let savedBlog = (await authReq('post', '/api/blogs', loginToken).send(newBlog));

        expect(savedBlog.body.user).toBeTruthy();
    })
})

afterAll(() => {
    mongoose.connection.close();
})
