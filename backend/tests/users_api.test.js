const supertest = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../app');
const api = supertest(app);
const User = require('../models/users');
const helper = require('../utils/users_helper');
const mongoose = require('mongoose');


describe('when there is initially one user in DB', () => {
    beforeEach(async () => {
        await User.deleteMany({});

        const passwordHash = await bcrypt.hash('something', 10);
        const user = new User({ username: 'chizo', name: 'chizaram nwazuo', passwordHash });

        await user.save();
    })

    test('creation succeeds with a valid username', async () => {
        const usersAtStart = await helper.usersInDB();

        let newUser = {
            username: 'victor',
            name: 'victor ozumba',
            password: 'something'
        }

        await api.post('/api/users')
            .send(newUser)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        const usersAtEnd = await helper.usersInDB();
        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

        const userNames = usersAtEnd.map(u => u.username);
        expect(userNames).toContain(newUser.username);

    })

    test('returns all users', async () => {
        let allUsers = helper.usersInDB();

        let returnedUsers = await api.get('/api/users').expect(200).expect('Content-Type', /application\/json/);
    })

    test('throws error for username or password with less than 3 chars', async () => {
        const usersAtStart = await helper.usersInDB();

        let userObj = {
            username: 'ai',
            name: 'ch',
            password: 'lu',
        }


        api.post('/api/users')
            .send(userObj)
            .expect(400);

        const usersAtEnd = await helper.usersInDB();

        expect(usersAtStart).toHaveLength(usersAtEnd.length);
    })

})

afterAll(() => {
    mongoose.connection.close();
})