import { body, param } from 'express-validator';
import { validarCampos } from './validarCampos.js';

export const validarVehiculo = [
    body('marca')
        .trim()
        .notEmpty().withMessage('La marca es obligatoria')
        .isLength({ max: 50 }).withMessage('La marca no puede superar los 50 caracteres'),
    
    body('modelo')
        .trim()
        .notEmpty().withMessage('El modelo es obligatorio')
        .isLength({ max: 50 }).withMessage('El modelo no puede superar los 50 caracteres'),
    
    body('patente')
        .trim()
        .notEmpty().withMessage('La patente es obligatoria')
        .isLength({ min: 6, max: 9 }).withMessage('La patente debe tener entre 6 y 9 caracteres')
        .toUpperCase(),
    
    body('anio')
        .notEmpty().withMessage('El año es obligatorio')
        .isInt({ min: 1950, max: new Date().getFullYear() + 1 })
        .withMessage('El año debe ser un número válido'),
    
    body('capacidad_carga')
        .notEmpty().withMessage('La capacidad de carga es obligatoria')
        .isFloat({ gt: 0 })
        .withMessage('La capacidad de carga debe ser un número mayor a 0'),

    validarCampos
];