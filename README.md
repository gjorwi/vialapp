# API VialActivo

API para reportar y gestionar incidencias en la vía pública. Desarrollada con Node.js, Express y MongoDB.

## Características

- CRUD completo para reportes de incidencias
- Búsqueda de reportes por ubicación geográfica
- Validación de datos
- Manejo de errores
- Documentación de la API
- CORS habilitado
- Logging de solicitudes

## Requisitos Previos

- Node.js (v14 o superior)
- MongoDB (local o remoto)
- npm o yarn

## Instalación

1. Clonar el repositorio:
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd apivial
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Configurar variables de entorno:
   Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/vialactivo
   NODE_ENV=development
   ```

## Iniciar el Servidor

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm start
```

El servidor estará disponible en `http://localhost:3000`

## Endpoints de la API

### Reportes

- `GET /api/v1/reportes` - Obtener todos los reportes
- `POST /api/v1/reportes` - Crear un nuevo reporte
- `GET /api/v1/reportes/:id` - Obtener un reporte por ID
- `PUT /api/v1/reportes/:id` - Actualizar un reporte
- `DELETE /api/v1/reportes/:id` - Eliminar un reporte
- `GET /api/v1/reportes/cercanos?latitud=X&longitud=Y&distancia=Z` - Buscar reportes cercanos a una ubicación

### Ejemplo de Creación de Reporte

```json
{
  "titulo": "Bache en avenida principal",
  "descripcion": "Bache grande en la esquina de la avenida principal con calle 5",
  "ubicacion": {
    "type": "Point",
    "coordenadas": [-58.3816, -34.6037]
  },
  "estado": "reportado",
  "imagenUrl": "https://ejemplo.com/imagen-bache.jpg"
}
```

## Estructura del Proyecto

```
apivial/
├── models/               # Modelos de Mongoose
│   └── Reporte.js        # Modelo de Reporte
├── routes/               # Rutas de la API
│   └── reportes.js       # Rutas para los reportes
├── .env                  # Variables de entorno
├── .gitignore            # Archivos a ignorar por Git
├── index.js              # Punto de entrada de la aplicación
├── package.json          # Dependencias y scripts
└── README.md             # Documentación
```

## Variables de Entorno

| Variable      | Descripción                               | Valor por Defecto                  |
|---------------|-------------------------------------------|-----------------------------------|
| PORT          | Puerto del servidor                       | 3000                              |
| MONGODB_URI   | URL de conexión a MongoDB                 | mongodb://localhost:27017/vialactivo |
| NODE_ENV      | Entorno de ejecución (development/production) | development                       |


## Scripts Disponibles

- `npm start` - Inicia el servidor en producción
- `npm run dev` - Inicia el servidor en desarrollo con nodemon
- `npm test` - Ejecuta las pruebas (pendiente de implementar)
- `npm run lint` - Ejecuta el linter (pendiente de implementar)

## Contribución

1. Haz un fork del proyecto
2. Crea una rama para tu característica (`git checkout -b feature/AmazingFeature`)
3. Haz commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Haz push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

Desarrollado por [Tu Nombre] - [@tucuenta](https://github.com/tucuenta)
