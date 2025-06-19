const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Reporte = require('../models/Reporte');
const multer = require('multer');

// Middleware para validar ObjectId
const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
      success: false,
      error: 'ID de reporte no válido'
    });
  }
  next();
};
const cloudinary = require('cloudinary').v2;

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: 'dxjfo6whd',
  api_key: '896638362276395',
  api_secret: 'j0JKXPGg-Dzq6e5CL8Iez26jHkw',
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage, fileFilter: (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
} });

// Crear un nuevo reporte
router.post('/reportes', upload.single('foto'), async (req, res, next) => {
  try {
    //los datos de ubicacion vienen con JSON.stringify y en formato [longitud, latitud]
    const ubicacion = JSON.parse(req.body.ubicacion);
    const reporte = new Reporte(req.body);
    if (req.file) {
      try {
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: "evidencias",
        });
        reporte.fotoUrl = result.secure_url;
      } catch (uploadError) {
        console.error('Error al subir a Cloudinary:', uploadError);
        return next(new Error('Error al subir la imagen a Cloudinary'));
      }
    }
    //las medidas vienen como JSON.stringify, pasar a numero
    //verificar que vienen y que sea en formato JSON para poder parsear
    if (req.body.medidas && typeof req.body.medidas === 'string') {
      const medidas = JSON.parse(req.body.medidas);
      reporte.medidas = {
        alto: parseFloat(medidas.alto),
        ancho: parseFloat(medidas.ancho),
        largo: parseFloat(medidas.largo)
      };
    }
    reporte.ubicacion = {
      type: 'Point',
      coordinates: ubicacion
    };
    await reporte.save();
    res.status(201).json({
      success: true,
      data: reporte
    });
  } catch (error) {
    next(error);
  }
});

// Obtener todos los reportes
router.get('/reportes', async (req, res, next) => {
  try {
    const reportes = await Reporte.find();
    res.status(200).json({
      success: true,
      count: reportes.length,
      data: reportes
    });
  } catch (error) {
    next(error);
  }
});

// Rutas específicas que deben ir antes que las parametrizadas

// Buscar reportes cercanos a una ubicación
router.post('/reportes/cercanos', async (req, res, next) => {
  try {
    console.log('Parametros de la consulta:', req.body);
    
    const { lat, lng, radius = 10000 } = req.body; // distancia en metros por defecto 10km
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'Se requieren latitud y longitud como parámetros de consulta'
      });
    }
    console.log('Preparando la consulta para obtener reportes cercanos');
    
    const reportes = await Reporte.find({
      ubicacion: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius)
        }
      }
    });
    console.log('Reportes cercanos:', reportes);
    res.status(200).json({
      success: true,
      count: reportes.length,
      data: reportes
    });
  } catch (error) {
    next(error);
  }
});
//ruta para realizar la busqueda de reportes por area
router.get('/reportes/en-area', async (req, res, next) => {
  try {
    const { neLat, neLng, swLat, swLng } = req.query;
    const reportes = await Reporte.find({
      ubicacion: {
        $geoWithin: {
          $geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [parseFloat(neLng), parseFloat(neLat)],
                [parseFloat(neLng), parseFloat(swLat)],
                [parseFloat(swLng), parseFloat(swLat)],
                [parseFloat(swLng), parseFloat(neLat)],
                [parseFloat(neLng), parseFloat(neLat)]
              ]
            ]
          }
        }
      }
    });
    console.log('Reportes en área:', reportes); 
    res.status(200).json({
      success: true,
      count: reportes.length,
      data: reportes
    });
  } catch (error) {
    next(error);
  }
});

// Buscar reportes por usuario
router.get('/reportes/usuario/:userId', async (req, res, next) => {
  try {
    const reportes = await Reporte.find({ usuarioId: req.params.userId });
    res.status(200).json({
      success: true,
      count: reportes.length,
      data: reportes
    });
  } catch (error) {
    next(error);
  }
});

// Obtener un reporte por ID
router.get('/reportes/:id', validateObjectId, async (req, res, next) => {
  try {
    const reporte = await Reporte.findById(req.params.id);
    if (!reporte) {
      return res.status(404).json({
        success: false,
        error: 'Reporte no encontrado'
      });
    }
    res.status(200).json({
      success: true,
      data: reporte
    });
  } catch (error) {
    next(error);
  }
});

// Actualizar un reporte
router.put('/reportes/:id', validateObjectId, async (req, res, next) => {
  try {
    const reporte = await Reporte.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!reporte) {
      return res.status(404).json({
        success: false,
        error: 'Reporte no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: reporte
    });
  } catch (error) {
    next(error);
  }
});

// Eliminar un reporte
router.delete('/reportes/:id', validateObjectId, async (req, res, next) => {
  try {
    const reporte = await Reporte.findByIdAndDelete(req.params.id);
    
    if (!reporte) {
      return res.status(404).json({
        success: false,
        error: 'Reporte no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
});


module.exports = router;
