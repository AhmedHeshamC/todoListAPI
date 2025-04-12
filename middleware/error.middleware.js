const errorMiddleware = (err, req, res, next) => {
  console.error(err.stack);

  // MySQL duplicate entry error
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(400).json({
      message: 'Duplicate field value entered'
    });
  }

  // MySQL foreign key constraint error
  if (err.code === 'ER_NO_REFERENCED_ROW') {
    return res.status(400).json({
      message: 'Referenced entity does not exist'
    });
  }

  res.status(err.statusCode || 500).json({
    message: err.message || 'Server Error'
  });
};

module.exports = errorMiddleware;
