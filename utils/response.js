/**
 * Standard API Response Helpers
 */
exports.sendSuccess = (res, statusCode = 200, message = 'Success', data = null) => {
  const response = {
    success: true,
    message
  };

  if (data !== null && data !== undefined) {
    if (typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length > 0 && !data._id) {
      Object.assign(response, data);
    } else {
      response.data = data;
    }
  }

  return res.status(statusCode).json(response);
};

exports.sendError = (res, statusCode = 400, message = 'Error') => {
  return res.status(statusCode).json({
    success: false,
    message
  });
};
