import { pool } from '../config/db.js';

// Obtener todos los conductores
export const obtenerConductores = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM conductores ORDER BY apellido ASC, nombre ASC');
        res.json({
            ok: true,
            conductores: rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, mensaje: 'Error al obtener los conductores' });
    }
};

// Obtener un conductor por ID
export const obtenerConductorPorId = async (req, res) => {
    const { id } = req.params;

    try {
        const [rows] = await pool.query('SELECT * FROM conductores WHERE id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Conductor no encontrado'
            });
        }

        res.json({
            ok: true,
            conductor: rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, mensaje: 'Error al obtener el conductor' });
    }
};

// Crear un nuevo conductor
export const crearConductor = async (req, res) => {
    const { nombre, apellido, dni, licencia, fecha_alta_licencia, fecha_vencimiento_licencia } = req.body;

    try {
        // Verificar si ya existe otro conductor con el mismo DNI o licencia
        const [existe] = await pool.query(
            'SELECT id, dni, licencia FROM conductores WHERE dni = ? OR licencia = ?',
            [dni, licencia]
        );

        if (existe.length > 0) {
            const conflicto = existe[0].dni === dni ? 'DNI' : 'número de licencia';
            return res.status(400).json({
                ok: false,
                mensaje: `Ya existe un conductor registrado con ese ${conflicto}`
            });
        }

        const [resultado] = await pool.query(
            `INSERT INTO conductores 
            (nombre, apellido, dni, licencia, fecha_alta_licencia, fecha_vencimiento_licencia) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [nombre, apellido, dni, licencia, fecha_alta_licencia, fecha_vencimiento_licencia]
        );

        res.status(201).json({
            ok: true,
            mensaje: 'Conductor registrado correctamente',
            conductor: {
                id: resultado.insertId,
                nombre,
                apellido,
                dni,
                licencia,
                fecha_alta_licencia,
                fecha_vencimiento_licencia
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, mensaje: 'Error al crear el conductor' });
    }
};

// Actualizar un conductor existente
export const actualizarConductor = async (req, res) => {
    const { id } = req.params;
    const { nombre, apellido, dni, licencia, fecha_alta_licencia, fecha_vencimiento_licencia } = req.body;

    try {
        // Verificar que el conductor exista
        const [conductorActual] = await pool.query('SELECT id FROM conductores WHERE id = ?', [id]);
        if (conductorActual.length === 0) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Conductor no encontrado'
            });
        }

        // Verificar que el DNI o licencia no estén en uso por otro conductor
        const [duplicado] = await pool.query(
            'SELECT id, dni, licencia FROM conductores WHERE (dni = ? OR licencia = ?) AND id != ?',
            [dni, licencia, id]
        );

        if (duplicado.length > 0) {
            const conflicto = duplicado[0].dni === dni ? 'DNI' : 'número de licencia';
            return res.status(400).json({
                ok: false,
                mensaje: `Otro conductor ya tiene asignado ese ${conflicto}`
            });
        }

        // Actualizar registro
        await pool.query(
            `UPDATE conductores 
             SET nombre = ?, apellido = ?, dni = ?, licencia = ?, 
                 fecha_alta_licencia = ?, fecha_vencimiento_licencia = ?
             WHERE id = ?`,
            [nombre, apellido, dni, licencia, fecha_alta_licencia, fecha_vencimiento_licencia, id]
        );

        res.json({
            ok: true,
            mensaje: 'Conductor actualizado correctamente',
            conductor: {
                id: Number(id),
                nombre,
                apellido,
                dni,
                licencia,
                fecha_alta_licencia,
                fecha_vencimiento_licencia
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, mensaje: 'Error al actualizar el conductor' });
    }
};

// Eliminar conductor
export const eliminarConductor = async (req, res) => {
    const { id } = req.params;

    try {
        const [resultado] = await pool.query('DELETE FROM conductores WHERE id = ?', [id]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                ok: false,
                mensaje: 'Conductor no encontrado'
            });
        }

        res.json({
            ok: true,
            mensaje: 'Conductor eliminado correctamente'
        });
    } catch (error) {
        // Si tiene viajes asociados
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({
                ok: false,
                mensaje: 'No se puede eliminar el conductor porque tiene viajes registrados a su nombre'
            });
        }
        console.error(error);
        res.status(500).json({ ok: false, mensaje: 'Error al eliminar el conductor' });
    }
};