import { body } from 'express-validator';
import { validarCampos } from './validarCampos.js';

export const validarConductor = [
    body('nombre')
        .trim()
        .notEmpty().withMessage('El nombre es obligatorio')
        .isLength({ max: 40 }).withMessage('El nombre no puede superar los 40 caracteres'),

    body('apellido')
        .trim()
        .notEmpty().withMessage('El apellido es obligatorio')
        .isLength({ max: 40 }).withMessage('El apellido no puede superar los 40 caracteres'),

    body('dni')
        .trim()
        .notEmpty().withMessage('El DNI es obligatorio')
        .isLength({ min: 7, max: 20 }).withMessage('El DNI debe tener entre 7 y 20 caracteres')
        .isNumeric().withMessage('El DNI debe contener solo números'),

    body('licencia')
        .trim()
        .notEmpty().withMessage('El número de licencia es obligatorio')
        .isLength({ max: 50 }).withMessage('La licencia no puede superar los 50 caracteres'),

    body('fecha_alta_licencia')
        .notEmpty().withMessage('La fecha de alta de licencia es obligatoria')
        .isISO8601().withMessage('La fecha de alta debe tener un formato válido (Año-Mes-Dia)'),

    body('fecha_vencimiento_licencia')
        .notEmpty().withMessage('La fecha de vencimiento de licencia es obligatoria')
        .isISO8601().withMessage('La fecha de vencimiento debe tener un formato válido (Año-Mes-Dia)')
        .custom((fechaVencimiento, { req }) => {
            if (new Date(fechaVencimiento) <= new Date(req.body.fecha_alta_licencia)) {
                throw new Error('La fecha de vencimiento debe ser posterior a la fecha de alta');
            }
            return true;
        }),

    validarCampos
];