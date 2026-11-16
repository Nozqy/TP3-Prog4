import { body } from 'express-validator';
import { validarCampos } from './validarCampos.js';

export const validarViaje = [
    body('vehiculo_id')
        .notEmpty().withMessage('El ID del vehículo es obligatorio')
        .isInt({ min: 1 }).withMessage('El ID del vehículo debe ser un número entero válido'),

    body('conductor_id')
        .notEmpty().withMessage('El ID del conductor es obligatorio')
        .isInt({ min: 1 }).withMessage('El ID del conductor debe ser un número entero válido'),

    body('fecha_salida')
        .notEmpty().withMessage('La fecha de salida es obligatoria')
        .isISO8601().withMessage('La fecha de salida debe tener un formato válido (AÑO-MES-DIA)'),

    body('fecha_llegada')
        .notEmpty().withMessage('La fecha de llegada es obligatoria')
        .isISO8601().withMessage('La fecha de llegada debe tener un formato válido (AÑO-MES-DIA)')
        .custom((fechaLlegada, { req }) => {
            if (new Date(fechaLlegada) < new Date(req.body.fecha_salida)) {
                throw new Error('La fecha de llegada no puede ser anterior a la fecha de salida');
            }
            return true;
        }),

    body('origen')
        .trim()
        .notEmpty().withMessage('El origen es obligatorio')
        .isLength({ max: 100 }).withMessage('El origen no puede superar los 100 caracteres'),

    body('destino')
        .trim()
        .notEmpty().withMessage('El destino es obligatorio')
        .isLength({ max: 100 }).withMessage('El destino no puede superar los 100 caracteres'),

    body('kilometros')
        .notEmpty().withMessage('Los kilómetros son obligatorios')
        .isFloat({ gt: 0 }).withMessage('Los kilómetros deben ser un número mayor a 0'),

    body('observaciones')
        .optional({ values: 'falsy' })
        .trim()
        .isString().withMessage('Las observaciones deben ser hechas en texto'),

    validarCampos
];