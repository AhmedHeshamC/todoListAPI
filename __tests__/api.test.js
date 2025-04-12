const request = require('supertest');
const app = require('../server');
const { refreshTokens } = require('../controllers/auth.controller');

let token, refreshToken, todoId;
const API_PREFIX = '/api/v1'; // Define API prefix for tests

describe('Auth API', () => {
  const user = {
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'password123'
  };

  afterAll(() => {
    refreshTokens.clear();
  });

  test('Register user', async () => {
    const res = await request(app)
      .post(`${API_PREFIX}/register`) // Add prefix
      .send(user);
    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    token = res.body.token;
    refreshToken = res.body.refreshToken;
  });

  test('Login user', async () => {
    const res = await request(app)
      .post(`${API_PREFIX}/login`) // Add prefix
      .send({ email: user.email, password: user.password });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });

  test('Refresh token', async () => {
    const res = await request(app)
      .post(`${API_PREFIX}/refresh-token`) // Add prefix
      .send({ refreshToken });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('Logout', async () => {
    const res = await request(app)
      .post(`${API_PREFIX}/logout`) // Add prefix
      .send({ refreshToken });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Logged out successfully');
  });
});

describe('Todo API', () => {
  let authToken;
  const todo = {
    title: 'Test Todo',
    description: 'Test Description'
  };

  beforeAll(async () => {
    // Register and login to get token
    await request(app).post(`${API_PREFIX}/register`).send({ // Add prefix
      name: 'Todo User',
      email: 'todouser@example.com',
      password: 'password123'
    });
    const res = await request(app)
      .post(`${API_PREFIX}/login`) // Add prefix
      .send({ email: 'todouser@example.com', password: 'password123' });
    authToken = res.body.token;
  });

  test('Create todo', async () => {
    const res = await request(app)
      .post(`${API_PREFIX}/todos`) // Add prefix
      .set('Authorization', `Bearer ${authToken}`)
      .send(todo);
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe(todo.title);
    todoId = res.body.id;
  });

  test('Get todos', async () => {
    const res = await request(app)
      .get(`${API_PREFIX}/todos`) // Add prefix
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('Update todo', async () => {
    const res = await request(app)
      .put(`${API_PREFIX}/todos/${todoId}`) // Add prefix
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Updated Todo', description: 'Updated Desc' });
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Updated Todo');
  });

  test('Delete todo', async () => {
    const res = await request(app)
      .delete(`${API_PREFIX}/todos/${todoId}`) // Add prefix
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.statusCode).toBe(204);
  });
});
