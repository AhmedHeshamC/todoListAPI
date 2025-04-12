const { pool } = require('../config/database');

class Todo {
  // Find todo by ID
  static async findById(id) {
    try {
      const [rows] = await pool.query('SELECT * FROM todos WHERE id = ?', [id]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }
  
  // Create new todo
  static async create(todoData) {
    try {
      const { title, description, userId } = todoData;
      
      const [result] = await pool.query(
        'INSERT INTO todos (title, description, user_id) VALUES (?, ?, ?)',
        [title, description, userId]
      );
      
      const [rows] = await pool.query('SELECT * FROM todos WHERE id = ?', [result.insertId]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }
  
  // Batch create todos
  static async batchCreate(todosData) {
    try {
      const createdTodos = [];
      
      // Use a transaction to ensure all todos are created or none
      const connection = await pool.getConnection();
      await connection.beginTransaction();
      
      try {
        for (const todoData of todosData) {
          const { title, description, userId } = todoData;
          
          const [result] = await connection.query(
            'INSERT INTO todos (title, description, user_id) VALUES (?, ?, ?)',
            [title, description, userId]
          );
          
          const [rows] = await connection.query('SELECT * FROM todos WHERE id = ?', [result.insertId]);
          createdTodos.push(rows[0]);
        }
        
        await connection.commit();
        connection.release();
        
        return createdTodos;
      } catch (error) {
        await connection.rollback();
        connection.release();
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }
  
  // Update todo
  static async update(id, todoData) {
    try {
      const { title, description } = todoData;
      
      await pool.query(
        'UPDATE todos SET title = ?, description = ? WHERE id = ?',
        [title, description, id]
      );
      
      const [rows] = await pool.query('SELECT * FROM todos WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }
  
  // Delete todo
  static async delete(id) {
    try {
      await pool.query('DELETE FROM todos WHERE id = ?', [id]);
      return true;
    } catch (error) {
      throw error;
    }
  }
  
  // Get user todos with pagination, filtering, and sorting
  static async findByUserId(userId, limit, offset, filterTitle = null, sortBy = 'created_at', sortOrder = 'desc') {
    try {
      let query = 'SELECT * FROM todos WHERE user_id = ?';
      let params = [userId];

      // Filtering
      if (filterTitle) {
        query += ' AND title LIKE ?';
        params.push(`%${filterTitle}%`);
      }

      // Sorting
      const allowedSortBy = ['created_at', 'title'];
      const allowedSortOrder = ['asc', 'desc'];
      if (!allowedSortBy.includes(sortBy)) sortBy = 'created_at';
      if (!allowedSortOrder.includes(sortOrder)) sortOrder = 'desc';
      query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;

      // Pagination
      query += ' LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const [rows] = await pool.query(query, params);

      // Count query
      let countQuery = 'SELECT COUNT(*) as total FROM todos WHERE user_id = ?';
      let countParams = [userId];
      if (filterTitle) {
        countQuery += ' AND title LIKE ?';
        countParams.push(`%${filterTitle}%`);
      }
      const [countResult] = await pool.query(countQuery, countParams);

      return {
        todos: rows,
        total: countResult[0].total
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Todo;
