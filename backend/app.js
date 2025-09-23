require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const prodsRoutes = require('./app/routes/prods.routes');
const errorHandler = require('./app/middlewares/errorHandler');
// const slug = require('slug'); // para CommonJS

const app = express();
const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);

// Middleware para parsear JSON
app.use(express.json());

const allowedOrigins = ['http://localhost:3001', 'http://localhost:3000'];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        return callback(new Error('CORS policy: acceso denegado para ' + origin), false);
      }
      return callback(null, true);
    }
  })
);

// Ruta de la API
app.use('/api/movendo', prodsRoutes);

// Middleware centralizado de errores
app.use(errorHandler);

// Conexión a MongoDB y arranque del servidor
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Conectado a MongoDB');
    app.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));
  })
  .catch(err => {
    console.error('Error conectando a MongoDB:', err.message);
    process.exit(1);
  });
