const request = require('supertest');
const db = require('../data/dbConfig');
const server = require('./server');

const jokes = require('./jokes/jokes-data');

test('sanity', () => {
  expect(true).toBe(true)
})

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});

afterAll(async () => {
  await db.destroy();
});

describe('endpoint tests', () => {
  const testUser = {
    "username": "joe",
    "password": "1234"
  }

  describe('[POST] /auth/register', () => {
    test('returns "username and password required" if username and password are not given', async () => {
      const res = await request(server).post('/api/auth/register').send({});

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('username and password required');
    });

    test('returns id, username, and password on successful register', async () => {
      const res = await request(server).post('/api/auth/register').send(testUser);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id', 1);
      expect(res.body).toHaveProperty('username', 'joe');
      expect(res.body).toHaveProperty('password');
    });

    test('returns "username taken" if username given already exists', async () => {
      const res = await request(server).post('/api/auth/register').send(testUser);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('username taken');
    });
  });

  describe('[POST] /auth/login', () => {
    test('returns "username and password required" if username and password are not given', async () => {
      const res = await request(server).post('/api/auth/login').send({});

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('username and password required');
    });

    test('returns "invalid credentials" if username does not exist or incorrect password', async () => {
      const res = await request(server).post('/api/auth/login').send({ "username": "james", "password": "4321" });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('invalid credentials');
    });

    test('returns a message and token on successful login', async () => {
      const res = await request(server).post('/api/auth/login').send(testUser);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'welcome joe');
      expect(res.body).toHaveProperty('token');
    });
  });

  describe('[GET] /jokes', () => {
    test('restricts access to jokes if token not provided', async () => {
      const res = await request(server).get('/api/jokes');

      expect(res.status).toBe(401);
      expect(res.body).not.toEqual(jokes);
      expect(res.body.message).toBe('token required');
    });

    test('if token provided, shows jokes', async () => {
      const login = await request(server).post('/api/auth/login').send(testUser);
      const testToken = login.body.token;

      const res = await request(server).get('/api/jokes').set('Authorization', testToken);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(jokes);
    });
  });

});