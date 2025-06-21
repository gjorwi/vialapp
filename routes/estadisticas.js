const express = require('express');
const router = express.Router();
const Reporte = require('../models/Reporte');

router.get('/estadisticas', async (req, res) => {
    try {
        const [results] = await Reporte.aggregate([
            {
                $facet: {
                    // Contadores generales por estado
                    estados: [
                        { $group: { _id: '$estado', count: { $sum: 1 } } }
                    ],
                    // Contadores por tipo de reporte
                    tipos: [
                        { $group: { _id: '$tipo', count: { $sum: 1 } } }
                    ],
                    // Top 3 municipios con más reportes
                    municipios: [
                        { $group: { _id: { municipio: '$municipio', tipo: '$tipo' }, count: { $sum: 1 } } },
                        { $group: {
                            _id: '$_id.municipio',
                            reportesPorTipo: { $push: { tipo: '$_id.tipo', count: '$count' } },
                            totalReportes: { $sum: '$count' }
                        }},
                        { $sort: { totalReportes: -1 } },
                        { $limit: 3 },
                        {
                            $project: {
                                _id: 0,
                                municipio: '$_id',
                                reportes: {
                                    $arrayToObject: {
                                        $map: {
                                            input: '$reportesPorTipo',
                                            as: 'item',
                                            in: ['$$item.tipo', '$$item.count']
                                        }
                                    }
                                }
                            }
                        }
                    ],
                    // Cálculo de asfalto requerido
                    asfaltoTotal: [
                        { $match: { tipo: 'pothole' } },
                        {
                            $group: {
                                _id: null,
                                // Convierte cm a m y calcula el volumen en m³ para cada bache, luego suma los totales.
                                totalVolumenM3: {
                                    $sum: {
                                        $multiply: [
                                            { $divide: [{ $ifNull: ['$medidas.largo', 0] }, 100] },
                                            { $divide: [{ $ifNull: ['$medidas.ancho', 0] }, 100] },
                                            { $divide: [{ $ifNull: ['$medidas.alto', 0] }, 100] }
                                        ]
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        ]);

        // Procesar los resultados de la agregación
        const estados = results.estados.reduce((acc, item) => {
            if (item._id === 'pendiente') acc.pendientes = item.count;
            if (item._id === 'en proceso') acc.enProceso = item.count;
            if (item._id === 'terminado') acc.terminados = item.count;
            return acc;
        }, { enProceso: 0, terminados: 0, pendientes: 0 });

        const totalReportes = estados.enProceso + estados.terminados + estados.pendientes;
        const tiposReportes = results.tipos.map(item => ({ tipo: item._id, cantidad: item.count }));

        // Extraer el volumen total en m³ de los resultados de la agregación.
        const mTotal = results.asfaltoTotal[0]?.totalVolumenM3 || 0;

        // Aplicar la fórmula para calcular la masa de asfalto requerida en kg.
        // Masa (kg) = (Volumen Total en m³ * Factor de compactación * Factor de desperdicio) * Densidad del asfalto (kg/m³)
        const masaKg = (mTotal * 1.3 * 1.10) * 2400;

        const materiales = {
            // Formatear el resultado a 2 decimales.
            asfalto: masaKg.toFixed(2),
        };

        const estadisticas = {
            totalReportes,
            ...estados,
            tiposReportes,
            materiales,
            municipiosConMasReportes: results.municipios
        };
        console.log('Estadisticas:', JSON.stringify(estadisticas, null, 2));
        res.json({ success: true, authentication: null, error: null, data: estadisticas });

    } catch (error) {
        console.log(JSON.stringify(error, null, 2));
        res.json({ success: false, authentication: null, error: error });
    }
});

module.exports = router;
