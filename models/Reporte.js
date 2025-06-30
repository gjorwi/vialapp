const mongoose = require('mongoose');

const reporteSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, 'El título es obligatorio'],
    trim: true,
    maxlength: [100, 'El título no puede tener más de 100 caracteres']
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción es obligatoria'],
    trim: true
  },
  ubicacion: {
    type:{
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function(v) {
          return v.length === 2 && 
                  v[0] >= -180 && v[0] <= 180 && 
                  v[1] >= -90 && v[1] <= 90;
        },
        message: 'Coordenadas inválidas. Debe ser [longitud, latitud] con valores válidos.'
      }
    }
  },
  estado: {
    type: String,
    enum: ['pendiente', 'en proceso', 'terminado', 'rechazado'],
    default: 'pendiente'
  },
  medidas: {
    alto: {
      type: Number,
    },
    ancho: {
      type: Number,
    },
    largo: {
      type: Number,
    }
  },
  tipo: {
    type: String,
    enum: ['pothole', 'traffic_light', 'light', 'other'],
    default: 'other'
  },
  vialidad: {
    type: String,
    enum: ['carretera_nacional', 'avenida_principal', 'troncal', 'calle_principal', 'calle'],
    default: 'other'
  },
  nivel: {
    type: String,
    enum: ['alto', 'medio', 'bajo'],
    default: 'medio'
  },
  cantidadTrafficLight: {
    type: Number,
    default: 0,
    validate: {
      validator: function(v) {
        return v >= 0;
      },
      message: 'La cantidad de semáforos debe ser mayor o igual a 0'
    }
  },
  cantidadLight: {
    type: Number,
    default: 0,
    validate: {
      validator: function(v) {
        return v >= 0;
      },
      message: 'La cantidad de lamparas debe ser mayor o igual a 0'
    }
  },
  fechaReporte: {
    type: Date,
    default: Date.now
  },
  usuarioId: {
    type: String,
    required: true
  },
  nombreUsuario: {
    type: String,
    required: true
  },
  emailUsuario: {
    type: String,
    required: true
  },
  direccion: {
    type: String,
  },
  municipio: {
    type: String,
  },
  parroquia: {
    type: String,
  },
  ciudad: {
    type: String,
  },
  ubiCompleta: {
    type: String,
  },
  fotoUrl: {
    type: String,
    trim: true,
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índice geoespacial para búsquedas por ubicación
reporteSchema.index({ 'ubicacion': '2dsphere' });

// Método para formatear la salida del objeto
reporteSchema.methods.toJSON = function() {
  const reporte = this;
  const reporteObject = reporte.toObject();

  // Eliminar campos sensibles o innecesarios
  delete reporteObject.__v;
  delete reporteObject.updatedAt;

  return reporteObject;
};

const Reporte = mongoose.model('Reporte', reporteSchema);

// Asegurar creación de índices (incluido 2dsphere)
Reporte.createIndexes();

module.exports = Reporte;
