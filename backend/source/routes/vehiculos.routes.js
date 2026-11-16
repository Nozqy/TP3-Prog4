import { Router } from 'express';
import { validarVehiculo, validarId } from '../middlewares/validacionesVehiculo.js';
// import { crearVehiculo, actualizarVehiculo } from '../controllers/vehiculos.controller.js';

const router = Router();

router.post('/', validarVehiculo, crearVehiculo);
router.put('/:id', validarId, validarVehiculo, actualizarVehiculo);

export default router;