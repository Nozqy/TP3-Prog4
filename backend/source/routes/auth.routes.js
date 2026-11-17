import { Router } from 'express';
import { registrarUsuario, loginUsuario } from '../controllers/auth.controller.js';
import { validarRegistroUsuario, validarLoginUsuario } from '../middlewares/validacionesUsuario.js';

const router = Router();

router.post('/registro', validarRegistroUsuario, registrarUsuario);
router.post('/login', validarLoginUsuario, loginUsuario);

export default router;