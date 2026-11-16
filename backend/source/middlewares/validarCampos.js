import { param, validationResult } from 'express-validator';

export const validarCampos = (req, res, next) => {
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Errores de validación en los datos enviados',
            errores: errores.array().map(err => ({
                campo: err.path,
                mensaje: err.msg,
                valorRecibido: err.value
            }))
        });
    }

    next();
};

export const validarId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número positivo'),
    validarCampos
];