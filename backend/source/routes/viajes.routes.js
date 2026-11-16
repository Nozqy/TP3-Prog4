import { Router } from 'express';
import {
    obtenerViajes,
    obtenerViajePorId,
    crearViaje,
    actualizarViaje,
    eliminarViaje
} from '../controllers/viajes.controller.js';
import { validarViaje } from '../middlewares/validacionesViaje.js';
import { validarId } from '../middlewares/validarCampos.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Proteger todas las rutas de viajes con JWT
router.use(verificarToken);

router.get('/', obtenerViajes);
router.get('/:id', validarId, obtenerViajePorId);
router.post('/', validarViaje, crearViaje);
router.put('/:id', validarId, validarViaje, actualizarViaje);
router.delete('/:id', validarId, eliminarViaje);

export default router;