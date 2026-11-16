import { pool } from '../config/db.js';

// Obtener todos los vehículos
export const obtenerVehiculos = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM vehiculos ORDER BY marca ASC, modelo ASC');
        res.json({
            ok: true,
            vehiculos: rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, mensaje: 'Error al obtener los vehículos' });
    }
};

// Obtener un vehículo por ID
export const obtenerVehiculoPorId = async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await pool.query('SELECT * FROM vehiculos WHERE id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Vehículo no encontrado'
            });
        }

        res.json({
            ok: true,
            vehiculo: rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, mensaje: 'Error al obtener el vehículo' });
    }
};

// Crear un nuevo vehículo
export const crearVehiculo = async (req, res) => {
    const { marca, modelo, patente, anio, capacidad_carga } = req.body;

    try {
        // Verificar si ya existe un vehículo con esa patente
        const [existe] = await pool.query(
            'SELECT id FROM vehiculos WHERE patente = ?',
            [patente]
        );

        if (existe.length > 0) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Ya existe un vehículo registrado con esa patente'
            });
        }

        const [resultado] = await pool.query(
            `INSERT INTO vehiculos (marca, modelo, patente, anio, capacidad_carga) 
             VALUES (?, ?, ?, ?, ?)`,
            [marca, modelo, patente, anio, capacidad_carga]
        );

        res.status(201).json({
            ok: true,
            mensaje: 'Vehículo registrado correctamente',
            vehiculo: {
                id: resultado.insertId,
                marca,
                modelo,
                patente,
                anio: Number(anio),
                capacidad_carga: Number(capacidad_carga)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, mensaje: 'Error al crear el vehículo' });
    }
};

// Actualizar un vehículo existente
export const actualizarVehiculo = async (req, res) => {
    const { id } = req.params;
    const { marca, modelo, patente, anio, capacidad_carga } = req.body;

    try {
        // Verificar que el vehículo exista
        const [vehiculoActual] = await pool.query('SELECT id FROM vehiculos WHERE id = ?', [id]);
        if (vehiculoActual.length === 0) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Vehículo no encontrado'
            });
        }

        // Verificar que la patente no esté en uso por OTRO vehículo
        const [duplicado] = await pool.query(
            'SELECT id FROM vehiculos WHERE patente = ? AND id != ?',
            [patente, id]
        );

        if (duplicado.length > 0) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Otro vehículo ya tiene asignada esa patente'
            });
        }

        // Actualizar registro
        await pool.query(
            `UPDATE vehiculos 
             SET marca = ?, modelo = ?, patente = ?, anio = ?, capacidad_carga = ?
             WHERE id = ?`,
            [marca, modelo, patente, anio, capacidad_carga, id]
        );

        res.json({
            ok: true,
            mensaje: 'Vehículo actualizado correctamente',
            vehiculo: {
                id: Number(id),
                marca,
                modelo,
                patente,
                anio: Number(anio),
                capacidad_carga: Number(capacidad_carga)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, mensaje: 'Error al actualizar el vehículo' });
    }
};

// Eliminar un vehículo
export const eliminarVehiculo = async (req, res) => {
    const { id } = req.params;

    try {
        const [resultado] = await pool.query('DELETE FROM vehiculos WHERE id = ?', [id]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Vehículo no encontrado'
            });
        }

        res.json({
            ok: true,
            mensaje: 'Vehículo eliminado correctamente'
        });
    } catch (error) {
        // Si tiene viajes asociados
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({
                ok: false,
                mensaje: 'No se puede eliminar el vehículo porque tiene viajes registrados'
            });
        }
        console.error(error);
        res.status(500).json({ ok: false, mensaje: 'Error al eliminar el vehículo' });
    }
};