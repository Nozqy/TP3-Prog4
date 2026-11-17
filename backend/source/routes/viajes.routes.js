import { Router } from 'express';
import {
    obtenerViajes,
    obtenerViajePorId,
    crearViaje,
    actualizarViaje,
    eliminarViaje,
    obtenerResumenPorVehiculo,
    obtenerResumenPorConductor
} from '../controllers/viajes.controller.js';
import { validarViaje } from '../middlewares/validacionesViaje.js';
import { validarId } from '../middlewares/validarCampos.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verificarToken);

router.get('/', obtenerViajes);
router.get('/vehiculo/:id', validarId, obtenerResumenPorVehiculo);
router.get('/conductor/:id', validarId, obtenerResumenPorConductor);
router.get('/:id', validarId, obtenerViajePorId);
router.post('/', validarViaje, crearViaje);
router.put('/:id', validarId, validarViaje, actualizarViaje);
router.delete('/:id', validarId, eliminarViaje);

export default router;