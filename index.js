require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

// Importar rutas
const reportesRouter = require('./routes/reportes');

// Inicializar la aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Habilita CORS para todas las rutas
app.use(morgan('dev')); // Logger para desarrollo
app.use(express.json()); // Para parsear JSON en las peticiones
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde la carpeta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas de la API
app.get('/', (req, res) => {
  res.json({
    message: '¡Bienvenido a la API de VialActivo!',
    version: '1.0.0',
    endpoints: {
      reportes: '/api/v1/reportes',
      documentacion: 'Próximamente...'
    }
  });
});

// Rutas de la API (versión 1)
app.use('/api/v1/', reportesRouter);
//ruta para loguear un administrador
app.use('/api/v1/admin', loginAdmin);

// Middleware para manejar rutas no encontradas (404)
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// Middleware para manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  // Errores de validación de Mongoose
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      error: 'Error de validación',
      messages
    });
  }

  // Error de duplicado de clave única
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      error: 'Entrada duplicada',
      message: 'Ya existe un registro con estos datos'
    });
  }

  // Error de Cast (ID de MongoDB no válido)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'ID no válido',
      message: 'El ID proporcionado no es válido'
    });
  }

  // Error genérico del servidor
  res.status(500).json({
    success: false,
    error: 'Error del servidor',
    message: err.message || 'Algo salió mal en el servidor',
    stack: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

// Configuración de MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vialactivo';

// Opciones de conexión
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Tiempo de espera para la selección del servidor
  socketTimeoutMS: 45000, // Tiempo de espera para las operaciones del socket
  family: 4 // Usar IPv4, omitir para IPv4/6
};

// Conectar a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, mongooseOptions);
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error al conectar con MongoDB:', error.message);
    // Reintentar la conexión después de 5 segundos
    setTimeout(connectDB, 5000);
  }
};

// Manejar eventos de conexión de Mongoose
mongoose.connection.on('error', err => {
  console.error('Error de conexión a MongoDB:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Desconectado de MongoDB');});

// Iniciar el servidor
const startServer = async () => {
  try {
    await connectDB();
    
    const server = app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📚 Documentación: http://localhost:${PORT}/api-docs`);
    });

    // Manejo de cierre elegante
    process.on('SIGTERM', () => {
      console.log('SIGTERM recibido. Cerrando servidor...');
      server.close(() => {
        console.log('Servidor cerrado');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Manejar excepciones no capturadas
process.on('uncaughtException', (error) => {
  console.error('Excepción no capturada:', error);
  process.exit(1);
});

// Manejar rechazos de promesas no manejados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Rechazo de promesa no manejado:');
  console.error('Promesa:', promise);
  console.error('Razón:', reason);
  // Cerrar servidor y salir
  process.exit(1);
});

// Iniciar la aplicación
startServer();
