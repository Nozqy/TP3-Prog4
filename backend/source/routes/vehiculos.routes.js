import { Router } from 'express';
import {
    obtenerVehiculos,
    obtenerVehiculoPorId,
    crearVehiculo,
    actualizarVehiculo,
    eliminarVehiculo
} from '../controllers/vehiculos.controller.js';
import { validarVehiculo } from '../middlewares/validacionesVehiculo.js';
import { validarId } from '../middlewares/validarCampos.js';
import { verificarToken } from '../middlewares/auth.middleware.js';

const router = Router();

// Proteger todas las rutas de vehículos con JWT
router.use(verificarToken);

router.get('/', obtenerVehiculos);
router.get('/:id', validarId, obtenerVehiculoPorId);
router.post('/', validarVehiculo, crearVehiculo);
router.put('/:id', validarId, validarVehiculo, actualizarVehiculo);
router.delete('/:id', validarId, eliminarVehiculo);

export default router;