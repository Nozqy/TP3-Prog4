import { Router } from 'express';
import {
    obtenerConductores,
    obtenerConductorPorId,
    crearConductor,
    actualizarConductor,
    eliminarConductor
} from '../controllers/conductores.controller.js';
import { validarConductor } from '../middlewares/validacionesConductor.js';
import { validarId } from '../middlewares/validarCampos.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Proteger todas las rutas de conductores con JWT
router.use(verificarToken);

router.get('/', obtenerConductores);
router.get('/:id', validarId, obtenerConductorPorId);
router.post('/', validarConductor, crearConductor);
router.put('/:id', validarId, validarConductor, actualizarConductor);
router.delete('/:id', validarId, eliminarConductor);

export default router;