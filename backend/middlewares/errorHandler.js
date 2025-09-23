function errorHandler(err, req, res, next){
  console.error(err.stack); // Logging completo para desarrollo

  const statusCode = err.status || 500;
  const message = statusCode < 500 ? err.message : 'Error interno del servidor';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }) // Mostrar stack solo en dev
  });
}

module.exports = errorHandler;