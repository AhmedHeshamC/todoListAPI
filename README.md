# Todo List API By Ahmed Hesham

A RESTful API for managing todo lists with user authentication.

## Features

- User registration and authentication (JWT + refresh token)
- Login and logout endpoints
- JWT-based authentication with refresh token support
- Secure password hashing
- CRUD operations for todo items
- Data validation with Joi
- Pagination, filtering, and sorting for todo items
- Error handling with descriptive messages
- Security measures (Helmet, CORS, rate limiting)
- Rate limiting for all and for auth endpoints
- Unit tests for authentication and todos
- MySQL database integration

## Technologies Used

- Node.js
- Express.js
- MySQL
- JWT for authentication
- Joi for validation
- Express Rate Limit for rate limiting

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MySQL

### Installation

1. Clone the repository
2. Install dependencies
   ```
   npm install
   ```
3. Configure environment variables
   - Create a `.env` file
   - Set your MySQL credentials, database name, and JWT secret
   ```
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=todolist
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=24h
   ```
4. Create MySQL database
   ```sql
   CREATE DATABASE todolist;
   ```
5. Start the server
   ```
   npm start
   ```
   or for development
   ```
   npm run dev
   ```

## API Documentation

### Authentication Endpoints

#### Register User

```
POST /register

Request:
{
  "name": "John Doe",
  "email": "john@doe.com",
  "password": "password"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "<refresh_token>"
}
```

#### Login User

```
POST /login

Request:
{
  "email": "john@doe.com",
  "password": "password"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "<refresh_token>"
}
```

#### Refresh Token

```
POST /refresh-token

Request:
{
  "refreshToken": "<your_refresh_token>"
}

Response:
{
  "token": "<new_access_token>"
}
```

#### Logout

```
POST /logout

Request:
{
  "refreshToken": "<your_refresh_token>"
}

Response:
{
  "message": "Logged out successfully"
}
```

### Todo Endpoints

All todo endpoints require authentication using the Bearer token in the Authorization header.

#### Get Todo Items

```
GET /todos?page=1&limit=10&title=search&sortBy=created_at&sortOrder=desc

Response:
{
  "data": [
    {
      "id": 1,
      "title": "Buy groceries",
      "description": "Buy milk, eggs, bread"
    }
  ],
  "page": 1,
  "limit": 10,
  "total": 1
}
```

#### Create Todo Item

```
POST /todos

Request:
{
  "title": "Buy groceries",
  "description": "Buy milk, eggs, and bread"
}

Response:
{
  "id": "1",
  "title": "Buy groceries",
  "description": "Buy milk, eggs, and bread"
}
```

#### Update Todo Item

```
PUT /todos/:id

Request:
{
  "title": "Buy groceries",
  "description": "Buy milk, eggs, bread, and cheese"
}

Response:
{
  "id": "1",
  "title": "Buy groceries",
  "description": "Buy milk, eggs, bread, and cheese"
}
```

#### Delete Todo Item

```
DELETE /todos/:id

Response: 204 No Content
```

## Error Handling

- 400 Bad Request - Invalid data or duplicate entry
- 401 Unauthorized - Invalid or missing token
- 403 Forbidden - User doesn't have permission
- 404 Not Found - Resource not found
- 429 Too Many Requests - Rate limiting
- 500 Server Error - Something went wrong on the server

## Security

- Passwords are hashed with bcrypt
- JWT and refresh tokens for authentication
- Helmet for HTTP headers security
- CORS enabled
- Rate limiting for all endpoints and stricter for auth endpoints

## Testing

- Unit tests for authentication and todo endpoints using Jest and Supertest

## License

MIT

## Author
Ahmed Hesham

## Acknowledgments
- [Express.js](https://expressjs.com/)
- [MySQL](https://www.mysql.com/)
- [JWT](https://jwt.io/)
- [Joi](https://joi.dev/)
- [bcrypt](https://www.npmjs.com/package/bcrypt)
- [dotenv](https://www.npmjs.com/package/dotenv)
- [express-rate-limit](https://www.npmjs.com/package/express-rate-limit)
- [helmet](https://www.npmjs.com/package/helmet)
- [cors](https://www.npmjs.com/package/cors)
- [Jest](https://jestjs.io/)
- [Supertest](https://www.npmjs.com/package/supertest)
- [mysql2](https://www.npmjs.com/package/mysql2)
- [express-validator](https://www.npmjs.com/package/express-validator)
- https://roadmap.sh/projects/todo-list-api
```
