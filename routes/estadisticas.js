const express = require('express');
const router = express.Router();
const Reporte = require('../models/Reporte');

router.get('/estadisticas', async (req, res) => {
    try {
        // Obtener todos los reportes con solo los campos necesarios
        const reportes = await Reporte.find({}, 'estado tipo municipio medidas cantidadLight cantidadTrafficLight');

        // Contar reportes por estado
        const estados = reportes.reduce((acc, reporte) => {
            if (reporte.estado === 'pendiente') acc.pendientes++;
            if (reporte.estado === 'en proceso') acc.enProceso++;
            if (reporte.estado === 'terminado') acc.terminados++;
            return acc;
        }, { enProceso: 0, terminados: 0, pendientes: 0 });

        // Contar reportes por tipo
        const tiposMap = new Map();
        reportes.forEach(reporte => {
            const tipo = reporte.tipo;
            tiposMap.set(tipo, (tiposMap.get(tipo) || 0) + 1);
        });
        const tiposReportes = Array.from(tiposMap.entries()).map(([tipo, cantidad]) => ({
            tipo,
            cantidad
        }));

        // Calcular total de reportes
        const totalReportes = reportes.length;

        // Calcular materiales (solo reportes pendientes)
        const reportesPendientes = reportes.filter(r => r.estado === 'pendiente');
        const baches = reportesPendientes.filter(r => r.tipo === 'pothole');
        const semaforos = reportesPendientes.filter(r => r.tipo === 'traffic_light');
        const luminarias = reportesPendientes.filter(r => r.tipo === 'light');
        
        // Calcular asfalto para baches
        let volumenTotalM3 = 0;
        baches.forEach(bache => {
            if (bache.medidas?.largo && bache.medidas.ancho && bache.medidas.alto) {
                const volumen = (bache.medidas.largo / 100) * (bache.medidas.ancho / 100) * (bache.medidas.alto / 100);
                volumenTotalM3 += volumen;
            }
        });
        
        // Calcular total de semáforos incluyendo la cantidad por reporte
        const totalSemaforos = semaforos.reduce((total, semaforo) => {
            return total + (semaforo.cantidadTrafficLight || 1);
        }, 0);
        
        // Calcular total de luminarias incluyendo la cantidad por reporte
        const totalLuminarias = luminarias.reduce((total, luminaria) => {
            return total + (luminaria.cantidadLight || 1);
        }, 0);
        
        const masaKg = (volumenTotalM3 * 1.3 * 1.10).toFixed(2);
        const materiales = { 
            asfalto: masaKg,
            semaforos: totalSemaforos,
            luminarias: totalLuminarias
        };

        // Obtener top 3 municipios con más reportes pendientes
        const municipiosMap = new Map();
        reportesPendientes.forEach(reporte => {
            if (!reporte.municipio) return;
            
            if (!municipiosMap.has(reporte.municipio)) {
                municipiosMap.set(reporte.municipio, {
                    municipio: reporte.municipio,
                    total: 0,
                    reportes: {}
                });
            }
            
            const municipio = municipiosMap.get(reporte.municipio);
            municipio.total++;
            municipio.reportes[reporte.tipo] = (municipio.reportes[reporte.tipo] || 0) + 1;
        });
        
        const municipiosConMasReportes = Array.from(municipiosMap.values())
            .sort((a, b) => b.total - a.total)
            .slice(0, 3);

        const estadisticas = {
            totalReportes,
            ...estados,
            tiposReportes,
            materiales,
            municipiosConMasReportes: municipiosConMasReportes
        };
        console.log('Estadisticas:', JSON.stringify(estadisticas, null, 2));
        res.json({ success: true, authentication: null, error: null, data: estadisticas });

    } catch (error) {
        console.log(JSON.stringify(error, null, 2));
        res.json({ success: false, authentication: null, error: error });
    }
});

module.exports = router;
