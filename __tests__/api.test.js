const request = require('supertest');
const app = require('../server');
const { refreshTokens } = require('../controllers/auth.controller');

let token, refreshToken, todoId;

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
      .post('/register')
      .send(user);
    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    token = res.body.token;
    refreshToken = res.body.refreshToken;
  });

  test('Login user', async () => {
    const res = await request(app)
      .post('/login')
      .send({ email: user.email, password: user.password });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });

  test('Refresh token', async () => {
    const res = await request(app)
      .post('/refresh-token')
      .send({ refreshToken });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('Logout', async () => {
    const res = await request(app)
      .post('/logout')
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
    await request(app).post('/register').send({
      name: 'Todo User',
      email: 'todouser@example.com',
      password: 'password123'
    });
    const res = await request(app)
      .post('/login')
      .send({ email: 'todouser@example.com', password: 'password123' });
    authToken = res.body.token;
  });

  test('Create todo', async () => {
    const res = await request(app)
      .post('/todos')
      .set('Authorization', `Bearer ${authToken}`)
      .send(todo);
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe(todo.title);
    todoId = res.body.id;
  });

  test('Get todos', async () => {
    const res = await request(app)
      .get('/todos')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('Update todo', async () => {
    const res = await request(app)
      .put(`/todos/${todoId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Updated Todo', description: 'Updated Desc' });
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Updated Todo');
  });

  test('Delete todo', async () => {
    const res = await request(app)
      .delete(`/todos/${todoId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.statusCode).toBe(204);
  });
});
