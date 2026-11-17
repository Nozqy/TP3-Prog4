import { pool } from '../config/db.js';

// Consulta base con INNER JOIN para reutilizar en los GET
const SELECT_VIAJES_JOIN = `
    SELECT 
        v.id,
        v.vehiculo_id,
        ve.marca AS vehiculo_marca,
        ve.modelo AS vehiculo_modelo,
        ve.patente AS vehiculo_patente,
        v.conductor_id,
        c.nombre AS conductor_nombre,
        c.apellido AS conductor_apellido,
        c.dni AS conductor_dni,
        v.fecha_salida,
        v.fecha_llegada,
        v.origen,
        v.destino,
        v.kilometros,
        v.observaciones
    FROM viajes v
    INNER JOIN vehiculos ve ON v.vehiculo_id = ve.id
    INNER JOIN conductores c ON v.conductor_id = c.id
`;

// Obtener todos los viajes 
export const obtenerViajes = async (req, res) => {
    const { vehiculo_id, conductor_id } = req.query;

    try {
        let query = SELECT_VIAJES_JOIN;
        const condiciones = [];
        const valores = [];

        if (vehiculo_id) {
            condiciones.push('v.vehiculo_id = ?');
            valores.push(vehiculo_id);
        }

        if (conductor_id) {
            condiciones.push('v.conductor_id = ?');
            valores.push(conductor_id);
        }

        if (condiciones.length > 0) {
            query += ' WHERE ' + condiciones.join(' AND ');
        }

        query += ' ORDER BY v.fecha_salida DESC';

        const [rows] = await pool.query(query, valores);

        res.json({
            ok: true,
            viajes: rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, mensaje: 'Error al obtener los viajes' });
    }
};

// Obtener un viaje por ID (con datos del vehículo y conductor)
export const obtenerViajePorId = async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await pool.query(`${SELECT_VIAJES_JOIN} WHERE v.id = ?`, [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Viaje no encontrado'
            });
        }

        res.json({
            ok: true,
            viaje: rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, mensaje: 'Error al obtener el viaje' });
    }
};

// Crear un nuevo viaje
export const crearViaje = async (req, res) => {
    const {
        vehiculo_id,
        conductor_id,
        fecha_salida,
        fecha_llegada,
        origen,
        destino,
        kilometros,
        observaciones
    } = req.body;

    try {
        // Verificar que el vehículo exista
        const [vehiculo] = await pool.query('SELECT id FROM vehiculos WHERE id = ?', [vehiculo_id]);
        if (vehiculo.length === 0) {
            return res.status(404).json({
                ok: false,
                mensaje: 'El vehículo especificado no existe'
            });
        }

        // Verificar que el conductor exista
        const [conductor] = await pool.query('SELECT id FROM conductores WHERE id = ?', [conductor_id]);
        if (conductor.length === 0) {
            return res.status(404).json({
                ok: false,
                mensaje: 'El conductor especificado no existe'
            });
        }

        // Insertar el viaje
        const [resultado] = await pool.query(
            `INSERT INTO viajes 
            (vehiculo_id, conductor_id, fecha_salida, fecha_llegada, origen, destino, kilometros, observaciones) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                vehiculo_id,
                conductor_id,
                fecha_salida,
                fecha_llegada,
                origen,
                destino,
                kilometros,
                observaciones || null
            ]
        );

        //  Consultar el viaje recién creado para devolverlo con los datos del vehículo y conductor
        const [nuevoViaje] = await pool.query(`${SELECT_VIAJES_JOIN} WHERE v.id = ?`, [resultado.insertId]);

        res.status(201).json({
            ok: true,
            mensaje: 'Viaje registrado correctamente',
            viaje: nuevoViaje[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, mensaje: 'Error al registrar el viaje' });
    }
};

// Actualizar un viaje existente
export const actualizarViaje = async (req, res) => {
    const { id } = req.params;
    const {
        vehiculo_id,
        conductor_id,
        fecha_salida,
        fecha_llegada,
        origen,
        destino,
        kilometros,
        observaciones
    } = req.body;

    try {
        // Verificar que el viaje exista
        const [viajeActual] = await pool.query('SELECT id FROM viajes WHERE id = ?', [id]);
        if (viajeActual.length === 0) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Viaje no encontrado'
            });
        }

        // Verificar que el vehículo exista
        const [vehiculo] = await pool.query('SELECT id FROM vehiculos WHERE id = ?', [vehiculo_id]);
        if (vehiculo.length === 0) {
            return res.status(404).json({
                ok: false,
                mensaje: 'El vehículo especificado no existe'
            });
        }

        // Verificar que el conductor exista
        const [conductor] = await pool.query('SELECT id FROM conductores WHERE id = ?', [conductor_id]);
        if (conductor.length === 0) {
            return res.status(404).json({
                ok: false,
                mensaje: 'El conductor especificado no existe'
            });
        }

        // Actualizar el registro
        await pool.query(
            `UPDATE viajes 
             SET vehiculo_id = ?, conductor_id = ?, fecha_salida = ?, fecha_llegada = ?, 
                 origen = ?, destino = ?, kilometros = ?, observaciones = ?
             WHERE id = ?`,
            [
                vehiculo_id,
                conductor_id,
                fecha_salida,
                fecha_llegada,
                origen,
                destino,
                kilometros,
                observaciones || null,
                id
            ]
        );

        // Devolver el viaje actualizado con JOIN
        const [viajeActualizado] = await pool.query(`${SELECT_VIAJES_JOIN} WHERE v.id = ?`, [id]);

        res.json({
            ok: true,
            mensaje: 'Viaje actualizado correctamente',
            viaje: viajeActualizado[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, mensaje: 'Error al actualizar el viaje' });
    }
};

// Eliminar un viaje
export const eliminarViaje = async (req, res) => {
    const { id } = req.params;

    try {
        const [resultado] = await pool.query('DELETE FROM viajes WHERE id = ?', [id]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Viaje no encontrado'
            });
        }

        res.json({
            ok: true,
            mensaje: 'Viaje eliminado correctamente'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, mensaje: 'Error al eliminar el viaje' });
    }
};

// Obtener historial de viajes y total de kilómetros de un vehículo específico
export const obtenerResumenPorVehiculo = async (req, res) => {
    const { id } = req.params;

    try {
        // 1. Verificar que el vehículo exista
        const [vehiculo] = await pool.query('SELECT * FROM vehiculos WHERE id = ?', [id]);
        if (vehiculo.length === 0) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Vehículo no encontrado'
            });
        }

        // Calcular total de kilómetros y cantidad de viajes
        const [estadisticas] = await pool.query(
            `SELECT 
                COUNT(id) AS cantidad_viajes,
                COALESCE(SUM(kilometros), 0) AS total_kilometros
             FROM viajes 
             WHERE vehiculo_id = ?`,
            [id]
        );

        // Obtener el listado de viajes de ese vehículo con datos del conductor
        const [viajes] = await pool.query(
            `${SELECT_VIAJES_JOIN} WHERE v.vehiculo_id = ? ORDER BY v.fecha_salida DESC`,
            [id]
        );

        res.json({
            ok: true,
            vehiculo: vehiculo[0],
            resumen: {
                cantidad_viajes: estadisticas[0].cantidad_viajes,
                total_kilometros: Number(estadisticas[0].total_kilometros)
            },
            viajes
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, mensaje: 'Error al obtener el resumen por vehículo' });
    }
};

// Obtener historial de viajes y total de kilómetros de un conductor específico
export const obtenerResumenPorConductor = async (req, res) => {
    const { id } = req.params;

    try {
        // Verificar que el conductor exista
        const [conductor] = await pool.query('SELECT * FROM conductores WHERE id = ?', [id]);
        if (conductor.length === 0) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Conductor no encontrado'
            });
        }

        // Calcular total de kilómetros y cantidad de viajes
        const [estadisticas] = await pool.query(
            `SELECT 
                COUNT(id) AS cantidad_viajes,
                COALESCE(SUM(kilometros), 0) AS total_kilometros
             FROM viajes 
             WHERE conductor_id = ?`,
            [id]
        );

        // Obtener el listado de viajes de ese conductor con datos del vehículo
        const [viajes] = await pool.query(
            `${SELECT_VIAJES_JOIN} WHERE v.conductor_id = ? ORDER BY v.fecha_salida DESC`,
            [id]
        );

        res.json({
            ok: true,
            conductor: conductor[0],
            resumen: {
                cantidad_viajes: estadisticas[0].cantidad_viajes,
                total_kilometros: Number(estadisticas[0].total_kilometros)
            },
            viajes
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, mensaje: 'Error al obtener el resumen por conductor' });
    }
};