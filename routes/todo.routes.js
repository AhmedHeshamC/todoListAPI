const express = require('express');
const router = express.Router();
const { getTodos, createTodo, updateTodo, deleteTodo, batchCreateTodos } = require('../controllers/todo.controller');
const { protect } = require('../middleware/auth.middleware');

// Protect all routes
router.use(protect);

// Routes
router.route('/')
  .get(getTodos)
  .post(createTodo);

router.route('/batch')
  .post(batchCreateTodos);

router.route('/:id')
  .put(updateTodo)
  .delete(deleteTodo);

module.exports = router;
