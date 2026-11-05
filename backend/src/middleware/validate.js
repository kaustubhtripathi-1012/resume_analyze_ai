function validate(schema, source = 'body') {
  return (req, res, next) => {
    try {
      const dataToValidate = req[source];
      const parsed = schema.parse(dataToValidate);
      req[source] = parsed;
      next();
    } catch (err) {
      const message = err.errors && err.errors.length > 0
        ? `${err.errors[0].path.join('.')}: ${err.errors[0].message}`
        : 'Invalid request data.';

      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message
        }
      });
    }
  };
}

module.exports = { validate };

