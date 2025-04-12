const Todo = require('../models/todo.model');
const Joi = require('joi');

// Validation schema
const todoSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow('')
});

// Get all todos
exports.getTodos = async (req, res, next) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Filtering
    const filterTitle = req.query.title || null;

    // Sorting
    let sortBy = req.query.sortBy || 'created_at';
    let sortOrder = req.query.sortOrder || 'desc';
    // Only allow certain fields and orders
    const allowedSortBy = ['created_at', 'title'];
    const allowedSortOrder = ['asc', 'desc'];
    if (!allowedSortBy.includes(sortBy)) sortBy = 'created_at';
    if (!allowedSortOrder.includes(sortOrder)) sortOrder = 'desc';

    // Get todos with pagination, filtering, and sorting
    const { todos, total } = await Todo.findByUserId(
      req.user.id,
      limit,
      offset,
      filterTitle,
      sortBy,
      sortOrder
    );

    // Format response
    const formattedTodos = todos.map(todo => ({
      id: todo.id,
      title: todo.title,
      description: todo.description
    }));

    res.status(200).json({
      data: formattedTodos,
      page,
      limit,
      total
    });
  } catch (error) {
    next(error);
  }
};

// Create todo
exports.createTodo = async (req, res, next) => {
  try {
    // Validate request data
    const { error } = todoSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { title, description } = req.body;

    // Create todo
    const todo = await Todo.create({
      title,
      description,
      userId: req.user.id
    });

    res.status(201).json({
      id: todo.id,
      title: todo.title,
      description: todo.description
    });
  } catch (error) {
    next(error);
  }
};

// Update todo
exports.updateTodo = async (req, res, next) => {
  try {
    // Validate request data
    const { error } = todoSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { title, description } = req.body;

    // Find todo
    const todo = await Todo.findById(req.params.id);

    // Check if todo exists
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    // Check if user owns the todo
    if (todo.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Update todo
    const updatedTodo = await Todo.update(req.params.id, {
      title,
      description
    });

    res.status(200).json({
      id: updatedTodo.id,
      title: updatedTodo.title,
      description: updatedTodo.description
    });
  } catch (error) {
    next(error);
  }
};

// Delete todo
exports.deleteTodo = async (req, res, next) => {
  try {
    // Find todo
    const todo = await Todo.findById(req.params.id);

    // Check if todo exists
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    // Check if user owns the todo
    if (todo.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Delete todo
    await Todo.delete(req.params.id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
